

class StartWebAppAction < Artifact  
  def build()
    $CATALINA_BASE=$prj
    "$lithium_home/tools/java/tomcat"
  end
end


class ReloadWebAppAction < Artifact

end
