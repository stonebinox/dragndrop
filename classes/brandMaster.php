<?php
/*---------------------------------
Author: Anoop Santhanam
Date created: 2/11/17 23:34
Last modified: 2/11/17 23:34
Comments: Main class file for
brand_master table.
---------------------------------*/
class brandMaster extends userMaster
{
    public $app=NULL;
    public $brandValid=false;
    private $brand_id=NULL;
    function __construct($brandID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if($brandID!=NULL)
        {
            $this->brand_id=addslashes(htmlentities($brandID));
            $this->brandValid=$this->verifyBrand();
        }
    }
    function verifyBrand()
    {
        if($this->brand_id!=NULL)
        {
            $brandID=$this->brand_id;
            $app=$this->app;
            $bm="SELECT user_master_iduser_master FROM brand_master WHERE stat='1' AND idbrand_master='$brandID'";
            $bm=$app['db']->fetchAssoc($bm);
            if(($bm!="")&&($bm!=NULL))
            {
                $userID=$bm['user_master_iduser_master'];
                userMaster::__construct($userID);
                if($this->userValid)
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
        else
        {
            return false;
        }
    }
    function getBrand()
    {
        $app=$this->app;
        if($this->brandValid)
        {
            $brandID=$this->brand_id;
            $bm="SELECT * FROM brand_master WHERE idbrand_master='$brandID'";
            $bm=$app['db']->fetchAssoc($bm);
            if(($bm!="")&&($bm!=NULL))
            {
                $userID=$bm['user_master_iduser_master'];
                userMaster::__construct($userID);
                $user=userMaster::getUser();
                if(is_array($user,$userID))
                {
                    $bm['user_master_iduser_master']=$user;
                }
                return $sm;
            }
            else
            {
                return "INVALID_BRAND_ID";
            }
        }
        else{
            return "INVALID_BRAND_ID";
        }
    }
    function getBrands()
    {
        $app=$this->app;
        $bm="SELECT idbrand_master FROM brand_master WHERE stat='1' ORDER BY idbrand_master DESC";
        $bm=$app['db']->fetchAll($bm);
        $brandArray=array();
        for($i=0;$i<count($bm);$i++)
        {
            $brandRow=$bm[$i];
            $brandID=$brandRow[$i];
            $this->__construct($brandID);
            $brand=$this->getBrand();
            if(is_array($brand))
            {
                array_push($brandArray,$brand);
            }
        }
        if(count($brandArray)>0)
        {
            return $brandArray;
        }
        else
        {
            return "NO_BRANDS_FOUND";
        }
    }
    function addBrand($brandName,$brandDesc='')
    {
        $app=$this->app;
        $userID=$app['session']->get("uid");
        userMaster::__construct($userID);
        if($this->userValid)
        {
            $brandName=trim(addslashes(htmlentities($brandName)));
            if(($brandName!="")&&($brandName!=NULL))
            {
                $brandDesc=trim(addslashes(htmlentities($brandDesc)));
                $bm="SELECT idbrand_master FROM brand_master WHERE stat='1' AND brand_name='$brandName' AND user_master_iduser_master='$userID'";
                $bm=$app['db']->fetchAssoc($bm);
                if(($bm=="")||($bm==NULL))
                {  
                    $in="INSERT INTO brand_master (timestamp,brand_name,brand_desc,user_master_iduser_master) VALUES (NOW(),'$brandName','$brandDesc','$userID')";
                    $in=$app['db']->executeQuery($in);
                    return "BRAND_ADDED";
                }
                else
                {
                    return "BRAND_ALREADY_EXISTS";
                }
            }
            else
            {
                return "INVALID_BRAND_NAME";
            }
        }
        else
        {
            return "INVALID_USER_ID";
        }
    }
}
?>