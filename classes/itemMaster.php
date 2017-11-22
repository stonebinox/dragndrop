<?php
/*-------------------------------
Author: Anoop Santhanam
Date Created: 4/11/17 15:51
Last modified: 4/11/17 15:51
Comments: Main class file for 
item_master table.
--------------------------------*/
class itemMaster extends campaignMaster
{
    public $app=NULL;
    public $itemValid=false;
    private $item_id=NULL;
    function __construct($itemID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if($itemID!=NULL)
        {
            $this->item_id=addslashes(htmlentities($itemID));
            $this->itemValid=$this->verifyItem();
        }
    }
    function verifyItem()
    {
        if($this->item_id!=NULL)
        {
            $itemID=$this->item_id;
            $app=$this->app;
            $im="SELECT campaign_master_idcampaign_master FROM item_master WHERE stat='1' AND iditem_master='$itemID'";
            $im=$app['db']->fetchAssoc($im);
            if(($im!="")&&($im!=NULL))
            {
                $campaignID=$im['campaign_master_idcampaign_master'];
                campaignMaster::__construct($campaignID);
                if($this->campaignValid)
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
    function getItem()
    {
        if($this->itemValid)
        {
            $app=$this->app;
            $itemID=$this->item_id;
            $im="SELECT * FROM item_master WHERE iditem_master='$itemID'";
            $im=$app['db']->fetchAssoc($im);
            if(($im!="")&&($im!=NULL))
            {
                $campaignID=$im['campaign_master_idcampaign_master'];
                campaignMaster::__construct($campaignMaster);
                $campaign=campaignMaster::getCampaign();
                if(is_array($campaign))
                {
                    $im['campaign_master_idcampaign_master']=$campaign;
                }
                return $im;
            }
            else
            {
                return "INVALID_IMAGE_ID";
            }
        }
        else
        {
            return "INVALID_IMAGE_ID";
        }
    }
    function getItems($campaignID)
    {
        $app=$this->app;
        $campaignID=addslashes(htmlentities($campaignID));
        campaignMaster::__construct($campaignID);
        if($this->campaignValid)
        {
            $im="SELECT iditem_master FROM item_master WHERE stat='1' AND campaign_master_idcampaign_master='$campaignID' ORDER BY iditem_master DESC";
            $im=$app['db']->fetchAll($im);
            $itemArray=array();
            for($i=0;$i<count($im);$i++)
            {
                $itemRow=$im[$i];
                $itemID=$itemRow['iditem_master'];
                $this->__construct($itemID);
                $item=$this->getItem();
                if(is_array($item))
                {
                    array_push($itemArray,$item);
                }
            }
            if(count($itemArray)>0)
            {
                return $itemArray;
            }
            else
            {
                return "NO_IMAGES_FOUND";
            }
        }
        else
        {
            return "INVALID_CAMPAIGN_ID";
        }
    }
    function uploadItem($campaignID,$fileObj,$description='')
    {
        $s3Client=$GLOBALS['s3Client'];
        $description=trim(addslashes(htmlentities($description)));
        $campaignID=addslashes(htmlentities($campaignID));
        campaignMaster::__construct($campaignID);
        if($this->campaignValid)
        {
            $app=$this->app;
            $file=$fileObj->getRealPath();
            $itemName=addslashes(htmlentities($fileObj->getClientOriginalName()));
            try{
                $result = $s3Client->putObject([
                    'ACL'        => 'public-read',
                    'Bucket'     => "dragncheck",
                    'Key'        => $itemName,
                    'SourceFile' => $file,
                ]);
            } catch (Exception $e) {
                return $e->getMessage();
            }
            $path=$result->get('ObjectURL');
            $in="INSERT INTO item_master (timestamp,item_name,item_path,campaign_master_idcampaign_master,item_description) VALUES (NOW(),'$itemName','$path','$campaignID','$description')";
            $in=$app['db']->executeQuery($in);
            return "ITEM_ADDED";
        }
        else
        {
            return "INVALID_CAMPAIGN_ID";
        }
    }
    function approveItem()
    {
        $app=$this->app;
        if($this->itemValid)
        {
            $itemID=$this->item_id;
            $im="UPDATE item_master SET approval_flag='1' WHERE iditem_master='$itemID'";
            $im=$app['db']->executeUpdate($im);
            return "ITEM_APPROVED";
        }
        else
        {
            return "INVALID_ITEM_ID";
        }
    }
    function rejectItem()
    {
        $app=$this->app;
        if($this->itemValid)
        {
            $itemID=$this->item_id;
            $im="UPDATE item_master SET approval_flag='2' WHERE iditem_master='$itemID'";
            $im=$app['db']->executeUpdate($im);
            return "ITEM_REJECTED";
        }
        else
        {
            return "INVALID_ITEM_ID";
        }
    }
}
?>