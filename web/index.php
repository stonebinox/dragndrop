<?php
ini_set('display_errors', 1);
require_once __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../src/app.php';
require __DIR__.'/../config/prod.php';
require __DIR__.'/../src/controllers.php';
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Aws\S3\S3Client;
use Aws\Exception\AwsException;
$app->register(new Silex\Provider\MonologServiceProvider(), array(
    'monolog.logfile' => 'php://stderr',
));
$app['debug']=true;
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/views',
));
/*$s3 = Aws\S3\S3Client::factory();
$bucket = getenv('S3_BUCKET')?: die('No "S3_BUCKET" config var in found in env!');
echo $bucket;*/
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
      'driver' => 'pdo_mysql',
      'dbname' => 'heroku_5a68e32f823f047',
      'user' => 'bcb316589694b3',
      'password' => 'ebbbdace',
      'host'=> "us-cdbr-iron-east-05.cleardb.net",
    )
));
$s3Client = new S3Client([
    'region' => 'us-east-2',
    'version' => 'latest'
]);
$app->register(new Silex\Provider\SessionServiceProvider, array(
    'session.storage.save_path' => dirname(__DIR__) . '/tmp/sessions'
));
$app->before(function(Request $request) use($app){
    $request->getSession()->start();
});
$app->get('/',function() use($app){
    if($app['session']->get("uid"))
    {
        return $app['twig']->render('index.twig'); 
    }
    else
    {
        return $app->redirect('/login');
    }
});
$app->get('/login',function() use($app){
    if($app['session']->get("uid"))
    {
        return $app->redirect("/dashboard");
    }
    else{
        return $app['twig']->render("login.twig");
    }
});
$app->get("registration",function() use($app){
    if($app['session']->get("uid"))
    {
        return $app->redirect("/dashboard");
    }
    else{
        return $app['twig']->render("registration.twig");
    }
});
$app->post("createAccount",function(Request $request) use($app){
    if(($request->get("user_name"))&&($request->get("user_email"))&&($request->get("user_password"))&&($request->get("user_password2")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        $user=new userMaster;
        $response=$user->createAccount($request->get("user_name"),$request->get("user_email"),$request->get("user_password"),$request->get("user_password2"));
        if($response=="ACCOUNT_CREATED")
        {
            return $app->redirect("/login");
        }
        else
        {
            return $app->redirect("/registration");
        }
    }
    else
    {
        return $app->redirect("registration");
    }
});
$app->post("/login_action",function(Request $request) use($app){
    if(($request->get("user_email"))&&($request->get("user_password")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        $user=new userMaster;
        $response=$user->authenticateUser($request->get("user_email"),$request->get("user_password"));
        if($response=="AUTHENTICATE_USER")
        {
            return $app->redirect("/dashboard");
        }
        else
        {
            return $app->redirect("/login");
        }
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->post("/googleLogin",function(Request $request) use($app){
    if(($request->get("id_token"))&&($request->get("user_email"))&&($request->get("user_name"))&&($request->get("creative_user")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        $user=new userMaster;
        if($request->get("creative_user")=="true")
        {
            $creativeUser=11;
        }
        else
        {
            $creativeUser=1;
        }
        $response=$user->createAccountWithGoogle($request->get("id_token"),$request->get("user_email"),$request->get("user_name"),$creativeUser);
        if($response=="USER_AUTHENTICATED")
        {
            $userID=$user->getUserIDFromEmail($request->get("user_email"));
            $user=new userMaster($userID);
            $adminID=$user->getAdminType();
            if($adminID==1)
            {
                return $app->redirect("/dashboard");
            }
            else
            {
                return $app->redirect("/agent");
            }
        }
        else{
            return $app->redirect("/login?err=1");
        }
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->get("/agent",function() use($app){
    if($app['session']->get("uid"))
    {
        return $app['twig']->render("agent.twig");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->get("logout",function() use($app){
    if($app['session']->get("uid")){
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        $userID=$app['session']->get("uid");
        $user=new userMaster($userID);
        $response=$user->logout();
        return $app->redirect("/login");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->get("/dashboard",function() use($app){
    if($app['session']->get("uid"))
    {
        return $app['twig']->render("dashboard.twig");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->get("/getBrands",function() use($app){
    if($app['session']->get("uid")){
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        $brandObj=new brandMaster;
        $brands=$brandObj->getBrands();
        if(is_array($brands))
        {
            return json_encode($brands);
        }
        else
        {
            return $brands;
        }
    }
    else{
        return "INVALID_PARAMETERS";
    }
});
$app->post("/saveBrand",function(Request $request) use($app){
    if($app['session']->get("uid")){
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        $brand=new brandMaster;
        $response=$brand->addBrand($request->get("brand_name"),$request->get("brand_desc"));
        return $response;
    }  
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/brandView",function() use($app){
    if(($app['session']->get("uid"))&&($app['session']->get("brand_id")))
    {
        return $app['twig']->render("brand.twig");
    }
    else
    {
        return $app->redirect("/dashboard");
    }
});
$app->get("/brand/{brandID}",function($brandID) use($app){
    $brandID=addslashes(htmlentities($brandID));
    if($app['session']->get("uid"))
    {
        $app['session']->set("brand_id",$brandID);
        return $app->redirect("/brandView");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->get("/getBrand",function() use($app){
    if(($app['session']->get("uid"))&&($app['session']->get("brand_id")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        $brandID=$app['session']->get("brand_id");
        $brandObj=new brandMaster($brandID);
        $brand=$brandObj->getBrand();
        if(is_array($brand))
        {
            return json_encode($brand);
        }
        else
        {
            return $brand;
        }
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/getCampaigns",function() use($app){
    if(($app['session']->get("uid"))&&($app['session']->get("brand_id")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        $campObj=new campaignMaster;
        $campaigns=$campObj->getCampaigns($app['session']->get("brand_id"));
        if(is_array($campaigns))
        {
            return json_encode($campaigns);
        }
        else
        {
            return $campaigns;
        }
    }
    else
    {
        return "INVAID_PARAMETERS";
    }
});
$app->post("/saveCampaign",function(Request $request) use($app){
    if($app['session']->get("uid")){
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        $campaign=new campaignMaster;
        $response=$campaign->addCampaign($request->get("campaign_name"),$request->get("camp_desc"));
        return $response;
    }  
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/campaign/{campaignID}",function($campaignID) use($app){
    if($app['session']->get("uid"))
    {
        $campaignID=addslashes(htmlentities($campaignID));
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        $campaign=new campaignMaster($campaignID);
        if($campaign->campaignValid)
        {
            $app['session']->set("campaign_id",$campaignID);
            $userID=$app['session']->get("uid");
            $user=new userMaster($userID);
            $adminID=$user->getAdminType();
            if($adminID==1)
            {
                return $app->redirect("/campaignView");
            }
            else
            {
                return $app->redirect("/agent/campaign");
            }
        }
        else
        {
            return $app->redirect("/brandView");
        }
    }
    else
    {
        return $app->redirect("/brandView");
    }
});
$app->get("/shareCampaign",function(Request $request) use($app){
    if(($app['session']->get("uid"))&&($request->get("email"))&&($request->get("campaign_id")))
    {  
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        require("../classes/itemMaster.php");
        require("../classes/shareMaster.php");
        $user=new userMaster;
        $userID=$user->getUserIDFromEmail($request->get("email"));
        if($userID!="INVALID_USER_EMAIL")
        {
            $share=new shareMaster;
            $response=$share->shareCampaign($request->get("campaign_id"),$userID);
            return $response;
        }
        else
        {
            return $userID;
        }
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/campaignView",function() use($app){
    if(($app['session']->get("uid"))&&($app['session']->get("brand_id"))&&($app['session']->get("campaign_id")))
    {
        return $app['twig']->render("index.html.twig");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->post("/uploadItem",function(Request $request) use($app){
    if(($app['session']->get("uid"))&&($app['session']->get("brand_id"))&&($app['session']->get("campaign_id"))&&($request->files->get("items")&&($request->get("description"))))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        require("../classes/itemMaster.php");
        $itemObj=new itemMaster;
        $response=$itemObj->uploadItem($app['session']->get("campaign_id"),$request->files->get("items",$request->get("description")));
        return $response;
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/getItems",function() use($app){
    if(($app['session']->get("uid"))&&($app['session']->get("campaign_id")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        require("../classes/itemMaster.php");
        $itemObj=new itemMaster;
        $campaignID=$app['session']->get("campaign_id");
        $items=$itemObj->getItems($campaignID);
        if(is_array($items))
        {
            return json_encode($items);
        }
        else
        {
            return $items;
        }
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/getSharedCampaigns",function() use($app){
    if($app['session']->get("uid"))
    {  
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        require("../classes/itemMaster.php");
        require("../classes/shareMaster.php");
        $share=new shareMaster;
        $shares=$share->getSharedCampaigns($app['session']->get("uid"));
        if(is_array($shares))
        {
            return json_encode($shares);
        }
        else
        {
            return $shares;
        }
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/agent/campaign",function() use($app){
    if(($app['session']->get("campaign_id"))&&($app['session']->get("uid")))
    {
        return $app['twig']->render("campaign.twig");
    }
    else
    {
        return $app->redirect("/agent");
    }
});
$app->get("/agent/approveItem",function(Request $request) use($app){
    if(($app['session']->get("uid"))&&($request->get("item_id")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        require("../classes/itemMaster.php");
        $item=new itemMaster($request->get("item_id"));
        $response=$item->approveItem();
        return $response;
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/agent/rejectItem",function(Request $request) use($app){
    if(($app['session']->get("uid"))&&($request->get("item_id")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/brandMaster.php");
        require("../classes/campaignMaster.php");
        require("../classes/itemMaster.php");
        $item=new itemMaster($request->get("item_id"));
        $response=$item->rejectItem();
        return $response;
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->run();
?>