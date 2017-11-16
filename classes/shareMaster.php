<?php
/*---------------------------------------
Author: Anoop Santhanam
Date Created: 16/11/17 11:37
Last Modified: 16/11/17 11:37
Comments: Main class file for
share_master table.
---------------------------------------*/
class shareMaster extends itemMaster
{
    public $app=NULL;
    public $shareValid=false;
    private $share_id=NULL;
    function __construct($shareID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if($shareID!=NULL)
        {
            $this->share_id=addslashes(htmlentities($shareID));
            $this->shareValid=$this->verifyShare();
        }
    }
    function verifyShare()
    {
        if($this->share_id!=NULL)
        {
            $app=$this->app;
            $shareID=$this->share_id;
            $sm="SELECT campaign_master_idcampaign_master,user_master_iduser_master FROM share_master WHERE stat='1' AND idshare_master='$shareID'";
            $sm=$app['db']->fetchAssoc($sm);
            if(($sm!="")&&($sm!=NULL))
            {
                $campaignID=$sm['campaign_master_idcampaign_master'];
                campaignMaster::__construct($campaignID);
                if($this->campaignValid)
                {
                    $userID=$sm['user_master_iduser_master'];
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
        else
        {
            return false;
        }
    }
    function shareCampaign($campaignID,$userID) //to share a campaign
    {
        $app=$this->app;
        $campaignID=addslashes(htmlentities($campaignID));
        campaignMaster::__construct($campaignID);
        if($this->campaignValid)
        {
            $userID=addslashes(htmlentities($userID));
            userMaster::__construct($userID);
            if($this->userValid)
            {
                $adminID=userMaster::getAdminType();
                if($adminID==11){
                    $sm="SELECT idshare_master FROM share_master WHERE user_master_iduser_master='$userID' AND campaign_master_idcampaign_master='$campaignID' AND stat='1'";
                    $sm=$app['db']->fetchAssoc($sm);
                    if(($sm=="")||($sm==NULL))
                    {
                        $in="INSERT INTO share_master (timestamp,campaign_master_idcampaign_master,user_master_iduser_master) VALUES (NOW(),'$campaignID','$userID')";
                        $in=$app['db']->executequery($in);
                        return "CAMPAIGN_SHARED";
                    }
                    else
                    {
                        return "CAMPAIGN_ALREADY_SHARED";
                    }
                }
                else{
                    return "INVALID_ADMIN_TYPE";
                }
            }
            else
            {
                return "INVALID_USER_ID";
            }
        }
        else
        {
            return "INVALID_CAMPAIGN_ID";
        }
    }
    function getShare()
    {
        if($this->shareValid)
        {
            $app=$this->app;
            $shareID=$this->share_id;
            $sm="SELECT * FROM share_master WHREE idshare_master='$shareID'";
            $sm=$app['db']->fetchAssoc($sm);
            if(($sm!="")&&($sm!=NULL))
            {
                $campaignID=$sm['campaign_master_idcampaign_master'];
                campaignMaster::__construct($campaignID);
                $campaign=campaignMaster::getCampaign();
                if(is_array($campaign))
                {
                    $sm['campaign_master_idcampaign_master']=$campaign;
                }
                $userID=$sm['user_master_iduser_master'];
                userMaster::__construct($userID);
                $user=userMaster::getUser();
                if(is_array($user))
                {
                    $sm['user_master_iduser_master']=$user;
                }
                return $sm;
            }
            else
            {
                return "INVALID_SHARE_ID";
            }
        }
        else
        {
            return "INVALID_SHARE_ID";
        }
    }
    function getSharedCampaigns($userID)
    {
        $userId=addslashes(htmlentities($userID));
        $app=$this->app;
        userMaster::__construct($userID);
        if($this->userValid)
        {
            $sm="SELECT idshare_master FROM share_master WHERE user_master_iduser_master='$userID' AND stat='1' ORDER BY idshare_master DESC";
            $sm=$app['db']->fetchAll($sm);
            $shareArray=array();
            for($i=0;$i<count($sm);$i++)
            {
                $share=$sm[$i];
                $shareID=$share['idshare_master'];
                $this->__construct($shareID);
                $share=$this->getShare();
                if(is_array($share))
                {
                    array_push($shareArray,$share);
                }
            }
            if(count($shareArray))
            {
                return $shareArray;
            }   
            else
            {
                return "NO_SHARED_CAMPAIGNS_FOUND";
            }         
        }
        else
        {
            return "INVALID_USER_ID";
        }
    }
}
?>