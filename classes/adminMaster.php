<?php
/*-------------------------------------------
Author: Anoop Santhanam
Date Created: 16/11/17 11:29
Last Modified: 16/11/17 11:29
Comments: Main class file for admin_master
table.
-------------------------------------------*/
class adminMaster
{
    public $app=NULL;
    public $adminValid=false;
    private $admin_id=NULL;
    function __construct($adminID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if($adminID!=NULL)
        {
            $this->admin_id=addslashes(htmlentities($adminID));
            $this->adminValid=$this->verifyAdmin();
        }
    }
    function verifyAdmin() //to verify an admin
    {
        if($this->admin_id!=NULL)
        {  
            $app=$this->app;
            $adminID=$this->admin_id;
            $am="SELECT idadmin_master FROM admin_master WHERE stat='1' AND idadmin_master='$adminID'";
            $am=$app['db']->fetchAssoc($am);
            if(($am!="")&&($am!=NULL))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
    function getAdmin() //to get an admin row
    {
        if($this->adminValid)
        {
            $app=$this->app;
            $adminID=$this->admin_id;
            $am="SELECT * FROM admin_master WHERE idadmin_master='$adminID'";
            $am=$app['db']->fetchAssoc($am);
            if(($am!="")&&($am!=NULL))
            {
                return $am;
            }
            else
            {
                return "INVALID_ADMIN_ID";
            }
        }
        else
        {
            return "INVALID_ADMIN_ID";
        }
    }
}
?>