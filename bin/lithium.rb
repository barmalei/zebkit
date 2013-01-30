require 'pathname'
require 'enumerator'

# detect whether the path is in a lithium project context
def __detect_project_home__(path, li = '.lithium')
    path = File.expand_path(path)
    prev_path = nil
    while path && prev_path != path
        marker = File.join(path, li)
        break if File.directory?(marker) && File.exists?(marker)
        prev_path = path
        path = File.dirname(path)
    end
    return path != prev_path ? path : nil
end

# I) Initialize lithium variables and load lithium artifacts
#  Define lithium dirs
$lithium_home = ENV['LITHIUM_HOME'].dup() if ENV['LITHIUM_HOME']
$lithium_home = __detect_project_home__(File.dirname(File.expand_path($0)))
raise "Lithium home cannot be identified" if !$lithium_home
raise "Lithium home '#{$lithium_home}' is invalid." if !File.exists?($lithium_home) || !File.directory?($lithium_home)

$lithium_home["\\"] = '/' if $lithium_home.index("\\")
$lithium_scripts_home = File.join($lithium_home, 'lib')
raise "Lithium scripts directory cannot be found #{$lithium_scripts_home}" if !File.directory?($lithium_scripts_home)

# modify ruby modules lookup path
$: << "#{$lithium_home}/lib"


puts "#{$lithium_home}/lib"

# handle options
$options, f = {}, nil
for i in 0..ARGV.length-1
    if ARGV[i][0,1] == '-'
        f = ARGV[i][1, ARGV[i].length]
        $options[f] = ''
    elsif f
        $options[f] = ARGV[i]
        f = nil
    else
        break
    end
end
$arguments = ARGV.length > 0 ? ARGV[i..ARGV.length-1] : []


# initialize stdout/stderr handler
require 'gravity/lithium/std'


if $options['std']
    std_s = $options['std'].strip()
    std_clazz = std_s == 'null' ? nil : Module.const_get(std_s)
else
    std_clazz = LithiumStd
end

if std_clazz
    std_f = $options['stdformat']
    std_i = std_f ? std_clazz.new(std_f) : std_clazz.new()
    raise 'Output handler class has to inherit Std class' if !std_i.kind_of?(Std)
    at_exit() { std_i.flush() }
end

# Load common utils
require 'gravity/lithium/util/misc'

# For the sake of completeness correct windows letter case
$lithium_home         = FileUtil.correct_win_path($lithium_home)
$lithium_scripts_home = FileUtil.correct_win_path($lithium_scripts_home)

#  II) Declare some useful methods
#  Show command line help
def __info__(msg=nil)
    puts_error " #{msg}" if msg
    File.open("#{$lithium_home}/lithium.txt", 'r') { |f|
        print while f.gets
    }
    exit(1)
end

def __project_home_by_abspath__(artifact, mask, li = ".lithium")
    raise "Artifact path '#{artifact}' is not absolute path." if !Pathname.new(artifact).absolute?()
    artifact = FileUtil.correct_win_path(artifact)
    project_home = __detect_project_home__(artifact, li) if File.exists?(artifact)

    if project_home.nil?
        project_home = artifact
        if !File.exists?(project_home) && project_home.split('/').length > 2
            project_home = File.dirname(project_home)
        end

        raise "Project home cannot be resolved by '#{project_home}'" if !File.exists?(project_home)
        project_home = File.dirname(project_home) if !mask && !File.directory?(project_home)
    end
    artifact = Pathname.new(artifact).relative_path_from(Pathname.new(project_home)).to_s
    [artifact, project_home]
end

#  III) ================ Parse input arguments to get project home and artifact name
#  Show instruction how to use lithium
__info__('No command or arguments have been specified.') if $arguments.length == 0

# split input argument into parts
names = []
$arguments[0].split(/(\w\w\:)/).each_slice(2) { |i|
    names << (i.length > 1 ? i[0] + i[1] : i[0])
}

# validate to avoid artifact aliases shorter than 2 characters
names.each { |n|
    s = n.split(':')
    raise "Invalid name '#{n[0, n.index(':') + 1]}'" if s.length > 1 && s[1][0,1] != '/' && s[1][0,1] != '\\'
}

# last name is supposed to be target $artifact
$artifact = names[-1]

# artifact name is not a path
$project_home = $context_name = nil
if $artifact[-1,1] == ':'
    $project_home = __detect_project_home__(".")
    $project_home = Dir.pwd() if $project_home.nil?
    $artifact = $arguments[0]
else
    #
    #  The result of this section is:
    #   => $project_home - absolute path to project home
    #   => $artifact     - absolute path to artifact

    # artifact name is a path
    # normalize path and expand it (make it absolute)
    $artifact["\\"] = '/' if $artifact.index("\\")

    # test if the artifact path is file mask and cut this mask
    i = $artifact.index(/[\?\*\{\}]/)
    artifact_mask = i ? $artifact[i, $artifact.length - i] : nil
    $artifact = $artifact[0, i-1] if i && i > 0

    # path is absolute path
    if Pathname.new($artifact).absolute?()
        $artifact, $project_home = __project_home_by_abspath__($artifact, artifact_mask) if $project_home.nil?
    else
        # path is not absolute
        $project_home = __detect_project_home__('.')
        if $project_home.nil?
            $artifact = File.expand_path($artifact)
            $artifact, $project_home = __project_home_by_abspath__($artifact, artifact_mask)
        # special case when path contains refernce to parent dirs
        elsif $artifact.index('..') || $artifact.index('./')
            $artifact = File.expand_path($artifact)
            ph = __detect_project_home__($artifact)
            if ph != $project_home
                $artifact, $project_home = __project_home_by_abspath__($artifact, artifact_mask)
            else
                $artifact = Pathname.new($artifact).relative_path_from(Pathname.new($project_home)).to_s
            end
        end
    end

    # form context name
    $context_name = $artifact.dup()
    $context_name = $context_name.gsub('/', '.')

    # add the cut parts of initial command to $artifact and return back cut mask
    $artifact = names[0..names.length-2].join() + $artifact if names.length > 1
    $artifact = "#{$artifact}/#{artifact_mask}" if artifact_mask
end

$project_home = FileUtil.correct_win_path($project_home)

# Store passed arguments
$arguments=$arguments.dup[1..$arguments.length]
$arguments ||= []

begin
    # load artifact core
    require 'gravity/lithium/core-artifact/project'

    # load project configuration
    load "#{$lithium_home}/.lithium/project.layout"
    if $project_home != $lithium_home && File.directory?("#{$project_home}/.lithium")
        load "#{$project_home}/.lithium/project.layout"

        # overload by context layout
        if $context_name
            files = FileUtil.filelist("#{$project_home}/.lithium/*.layout")
            # sort to keep longer names first
            files = files.sort!() { |a, b| (a.length > b.length) ? -1 : ((a.length < b.length) ? 1 : 0) }
            files.each() { |i|
                n = File.basename(i)
                n[".layout"] = ''
                if $context_name.index(n) == 0 && (n.length == $context_name.length || $context_name[n.length, 1] == '.')
                    $context_home = n.gsub(".", "/")
                    puts "Load context #{$context_home}"
                    load i
                    break
                end
            }
        end
    end

    # build it
    puts "TARGET: '#{$artifact}'"
    Artifact.artifact("BUILD:#{$artifact}").build()

    puts "TARGET '#{$artifact}' sucessfully DONE"
ensure
    begin  Artifact.artifact("goodby").build()
    rescue NameError ; end
end

