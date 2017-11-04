<?php
/*------------------------------------------
Author: Anoop Santhanam
Date Created: 04/11/17 00:30
Loast modified: 04/11/17 00:30
Comments: Main class file for
campaign_master table.
-----------------------------------------*/
class campaignMaster extends brandMaster
{
    public $app=NULL;
    public $campaignValid=false;
    private $campaign_id=NULL;
    function __construct($campaignID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if($campaignID!=NULL)
        {
            $this->campaign_id=addslashes(htmlentities($campaignID));
            $this->campaignValid=$this->verifyCampaign();
        }
    }
    function verifyCampaign()
    {
        if($this->campaign_id!=NULL)
        {
            $app=$this->app;
            $campaignID=$this->campaign_id;
            $cm="SELECT brand_master_idbrand_master WHERE stat='1' AND idcampaign_master='$campaignID'";
            $cm=$app['db']->fetchAssoc($cm);
            if(($cm!="")&&($cm!=NULL))
            {
                $brandID=$cm['brand_master_idbrand_master'];
                brandMaster::__construct($branAOI);
                if($this->brandValid)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else{
                return false;
            }
        }
        else
        {
            return false;
        }
    }
    function getCampaign()
    {
        if($this->campaignValid)
        {
            $app=$this->app;
            $campaignID=$this->campaign_id;
            $cm="SELECT * FROM campaign_master WHERE idcampaign_master='$campaignID'";
            $cm=$app['db']->fetchAssoc($cm);
            if(($cm!="")&&($cm!=NULL))
            {
                $brandID=$cm['brand_master_idbrand_master'];
                brandMaster::__construct($brandID);
                $brand=brandMaster::getBrand();
                if(is_array($brand)){
                    $cm['brand_master_idbrand_master']=$brand;
                }
                return $cm;
            }
            else
            {
                return "INVALID_CAMPAIGN_ID";
            }
        }
        else
        {
            return "INVALID_CAMPAIGN_ID";
        }
    }
    function getCampaigns($brandID)
    {
        $app=$this->app;
        $brandID=addslashes(htmlentities($brandID));
        brandMaster::__construct($brandID);
        if($this->brandValid)
        {
            $cm="SELECT idcampaign_master FROM campaign_master WHERE stat='1' AND brand_master_idbrand_master='$brandID' ORDER BY idcampaign_master DESC";
            $cm=$app['db']->fetchAll($cm);
            $campaignArray=array();
            for($i=0;$i<count($cm);$i++)
            {
                $campaignRow=$cm[$i];
                $campaignID=$campaignRow['idcampaign_master'];
                $this->__construct($campaignID);
                $campaign=$this->getCampaign();
                if(is_array($campaign))
                {
                    array_push($campaignArray,$campaign);
                }
            }
            if(count($campaignArray)>0)
            {
                return $campaginArray;
            }
            else
            {
                return "NO_CAMPAIGNS_FOUND";
            }
        }
        else
        {
            return "INVALID_BRAND_ID";
        }
    }
    function addCampaign($campaignName,$campaignDesc)
    {
        $app=$this->app;
        $brandID=addslashes(htmlentities($app['session']->get("brand_id")));
        brandMaster::__construct($brandID);
        if($this->brandValid)
        {
            $campaignName=trim(addslashes(htmlentities($campaignName)));
            if(($campaignName!="")&&($campaignName!=NULL)){
                $campaignDesc=trim(addslashes(htmlentities($campaignDesc)));
                $cm="SELECT idcampaign_master FROM campaign_master WHERE stat='1' AND campaign_name='$campaignName' AND brand_master_idbrand_master='$brandID'";
                $cm=$app['db']->fetchAssoc($cm);
                if(($cm=="")||($cm==NULL))
                {
                    $in="INSERT INTO campaign_master (timestamp,campaign_name,campaign_description,brand_master_idbrand_master) VALUES (NOW(),'$campaignName','$campignDesc','$brandID')";
                    $in=$app['db']->executeQuery($in);
                    return "CAMPAIGN_ADDED";
                }
                else
                {
                    return "CAMPAIGN_ALREADY_EXISTS";
                }
            }
            else{
                return "INVALID_CAMPAIGN_NAME";
            }
        }
        else
        {
            return "INVALID_BRAND_ID";
        }
    }
}
?>