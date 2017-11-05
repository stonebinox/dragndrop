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
    function uploadItem($campaignID,$fileObj)
    {
        $campaignID=addslashes(htmlentities($campaignID));
        campaignMaster::__construct($campaignID);
        if($this->campaignValid)
        {
            $file=$fileObj["tmp_name"];
            return $file;
            $itemName=addslashes(htmlentities($fileObj['name']));
            $nameParts='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            do{
                $fileName='';
                for($i=0;$i<strlen($itemName);$i++)
                {
                    $randomCharacter=$nameParts[rand(0,strlen($nameParts)-1)];
                    $fileName.=$randomCharacter;
                }
            }while(file_exists("../uploads/".$fileName.".".$ext));
            $path='../uploads/'.$fileName.'.'.$ext;
            $realName=trim(addslashes(htmlentities(basename($fileObj["name"]))));
            $destFTPURL='ftp://binox:c!rcle2011@binox.me/uploads/external/dragncheck/'.$fileName.'.'.$ext;
            $destURL='http://binox.me/uploads/external/dragncheck/'.$fileName.'.'.$ext;
            $handle=fopen($destFTPURL,"w");
            fwrite($handle,file_get_contents($file));
            fclose($handle);
            //if(!(move_uploaded_file($file,$path)))
            if(!(file_exists($destURL)))
            {
                return "UPLOAD_ERROR";
            }
            else
            {
                $in="INSERT INTO item_master (timestamp,item_name,item_path,campaign_master_idcampaign_master) VALUES (NOW(),'$itemName','$destURL','$campaignID')";
                $in=$app['db']->executeQuery($in);
                return "ITEM_ADDED";
            }
        }
        else
        {
            return "INVALID_CAMPAIGN_ID";
        }
    }
}
?>