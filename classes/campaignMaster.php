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
}
?>