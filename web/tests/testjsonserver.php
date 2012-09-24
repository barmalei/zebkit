<?php

class Test {
    
    /**
     * An dummy.
     *
     * @param string $s
     * @return string
     */
    public function dummy($s) {
        return '';
    }

    /**
     * An sum.
     *
     * @param int $a
     * @param int $b
     * @return ubt
     */
    public function sum($a, $b) {
        return $a + $b;
    }

}

require_once 'jsonRPCServer.php';
$service = new Test();
jsonRPCServer::handle($service);

?>