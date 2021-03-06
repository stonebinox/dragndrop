<?php
/*----------------------------------------
Author: Anoop Santhanam
Date Created: 22/10/17 18:41
Last Modified: 22/10/17 18:41
Comments: Main class file for user_master
table.
----------------------------------------*/
class userMaster extends adminMaster
{
    public $app=NULL;
    public $userValid=false;
    private $user_id=NULL;
    function __construct($userID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if($userID!=NULL)
        {
            $this->user_id=addslashes(htmlentities($userID));
            $this->userValid=$this->verifyUser();
        }
    }
    function verifyUser() //to verify a user
    {
        if($this->user_id!=NULL)
        {
            $userID=$this->user_id;
            $app=$this->app;
            $um="SELECT admin_master_idadmin_master FROM user_master WHERE stat='1' AND iduser_master='$userID'";
            $um=$app['db']->fetchAssoc($um);
            if(($um!="")&&($um!=NULL))
            {
                $adminID=$um['admin_master_idadmin_master'];
                adminMaster::__construct($adminID);
                if($this->adminValid)
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
    function getUser() //to get a user's details
    {
        if($this->userValid)
        {
            $app=$this->app;
            $userID=$this->user_id;
            $um="SELECT * FROM user_master WHERE iduser_master='$userID'";
            $um=$app['db']->fetchAssoc($um);
            if(($um!="")&&($um!=NULL))
            {
                $adminID=$um['admin_master_idadmin_master'];
                adminMaster::__construct($adminID);
                $admin=adminMaster::getAdmin();
                if(is_array($admin))
                {
                    $um['admin_master_idadmin_master']=$admin;
                }
                return $um;
            }
            else
            {
                return "INVALID_USER_ID";
            }
        }
        else
        {
            return "INVALID_USER_ID";
        }
    }
    function getUserIDFromEmail($userEmail)
    {
        $app=$this->app;
        $userEmail=addslashes(htmlentities($userEmail));
        $um="SELECT iduser_master FROM user_master WHERE stat='1' AND user_email='$userEmail'";
        $um=$app['db']->fetchAssoc($um);
        if(($um!="")&&($um!=NULL))
        {
            return $um['iduser_master'];
        }
        else
        {
            return "INVALID_USER_EMAIL";
        }
    }
    function getUserPassword()
    {
        if($this->userValid)
        {
            $app=$this->app;
            $userID=$this->user_id;
            $um="SELECT user_password FROM user_master WHERE iduser_master='$userID'";
            $um=$app['db']->fetchAssoc($um);
            if(($um!="")&&($um!=NULL))
            {
                return $um['user_password'];
            }
            else
            {
                return "INVALID_USER_ID";
            }
        }
        else
        {
            return "INVALID_USER_ID";
        }
    }
    function authenticateUser($userEmail,$userPassword) //to log a user in
    {
        $userEmail=addslashes(htmlentities($userEmail));
        $userID=$this->getUserIDFromEmail($userEmail);
        $app=$this->app;
        if(is_numeric($userID))
        {
            $this->__construct($userID);
            $userPassword=md5($userPassword);
            $storedPassword=$this->getUserPassword();
            if($userPassword==$storedPassword)
            {
                $up="UPDATE user_master SET online_flag='1' WHERE iduser_master='$userID'";
                $up=$app['db']->executeUpdate($up);
                $app['session']->set('uid',$userID);
                return "AUTHENTICATE_USER";
            }
            else
            {
                return "INVALID_USER_CREDENTIALS";
            }
        }
        else
        {
            return "INVALID_USER_CREDENTIALS";
        }
    }
    function createAccount($userName,$userEmail,$userPassword,$userPassword2) //to create an account
    {
        $app=$this->app;
        $userName=trim(addslashes(htmlentities($userName)));
        if(($userName!="")&&($userName!=NULL))
        {  
            $userEmail=trim(addslashes(htmlentities($userEmail)));
            if(filter_var($userEmail, FILTER_VALIDATE_EMAIL)){
                if(strlen($userPassword)>=8)
                {
                    if($userPassword===$userPassword2)
                    {
                        $um="SELECT iduser_master FROM user_master WHERE user_email='$userEmail' AND stat!='0'";
                        $um=$app['db']->fetchAssoc($um);
                        if(($um=="")||($um==NULL))
                        {
                            $hashPassword=md5($userPassword);
                            $in="INSERT INTO user_master (timestamp,user_name,user_email,user_password) VALUES (NOW(),'$userName','$userEmail','$hashPassword')";
                            $in=$app['db']->executeQuery($in);
                            return "ACCOUNT_CREATED";
                        }
                        else
                        {
                            return "ACCOUNT_ALREADY_EXISTS";
                        }
                    }
                    else
                    {
                        return "PASSWORD_MISMATCH";
                    }
                }
                else
                {
                    return "INVALID_PASSWORD";
                }
            }
            else
            {
                return "INVALID_USER_EMAIL";
            }
        }
        else
        {
            return "INVALID_USER_NAME";
        }
    }
    function logout() //to log a user out
    {
        if($this->userValid)
        {
            $app=$this->app;
            $userID=$this->user_id;
            $um="UPDATE user_master SET online_flag='0' WHERE iduser_master='$userID'";
            $um=$app['db']->executeUpdate($um);
            $app['session']->remove("uid");
            return "USER_LOGGED_OUT";
        }
        else
        {
            return "INVALID_USER_ID";
        }
    }
    function createAccountWithGoogle($idToken,$email,$userName,$adminID=1)
    {
        $app=$this->app;
        $idToken=addslashes($idToken);
        if(($idToken!="")&&($idToken!=NULL))
        {
            $email=trim(strtolower(addslashes(htmlentities($email))));
            if(($email!="")&&($email!=NULL))
            {
                $userName=trim(ucwords(addslashes(htmlentities($userName))));
                if(($userName!="")&&($userName!=NULL))
                {
                    $um="SELECT iduser_master FROM user_master WHERE user_email='$email' AND stat='1'";
                    $um=$app['db']->fetchAssoc($um);
                    if(($um!="")&&($um!=NULL))
                    {
                        $userID=$um['iduser_master'];
                        $up="UPDATE user_master SET online_flag='1' WHERE iduser_master='$userID'";
                        $up=$app['db']->executeUpdate($up);
                    }
                    else
                    {
                        $in="INSERT INTO user_master (timestamp,user_email,user_name,google_id_token,online_flag,admin_master_idadmin_master) VALUES (NOW(),'$email','$userName','$idToken','1','$adminID')";
                        $in=$app['db']->executeQuery($in);
                        $um="SELECT iduser_master FROM user_master WHERE user_email='$userEmail' AND stat='1'";
                        $um=$app['db']->fetchAssoc($um);
                        $userID=$um['iduser_master'];
                    }
                    $app['session']->set('uid',$userID);
                    return "USER_AUTHENTICATED";
                }
                else
                {
                    return "INVALID_USER_NAME";
                }
            }
            else
            {
                return "INVALID_USER_EMAIL";
            }
        }
        else
        {
            return "INVALID_ID_TOKEN";
        }
    }
    function getAdminType() //to get user's admin role
    {
        $app=$this->app;
        if($this->userValid)
        {
            $userID=$this->user_id;
            $um="SELECT admin_master_idadmin_master FROM user_master WHERE iduser_master='$userID'";
            $um=$app['db']->fetchAssoc($um);
            if(($um!="")&&($um!=NULL))
            {
                return $um['admin_master_idadmin_master'];
            }
            else
            {
                return "INVALID_USER_ID";
            }
        }
        else
        {
            return "INVALID_USER_ID";
        }
    }
}
?> 