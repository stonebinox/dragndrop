<?php
ini_set('display_errors', 1);
require_once __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../src/app.php';
require __DIR__.'/../config/prod.php';
require __DIR__.'/../src/controllers.php';
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
$app->register(new Silex\Provider\MonologServiceProvider(), array(
    'monolog.logfile' => 'php://stderr',
));
$app['debug']=true;
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/views',
));
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
      'driver' => 'pdo_mysql',
      'dbname' => 'heroku_5a68e32f823f047',
      'user' => 'bcb316589694b3',
      'password' => 'ebbbdace',
      'host'=> "us-cdbr-iron-east-05.cleardb.net",
    )
));
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
$app->get("logout",function() use($app){
    if($app['session']->get("uid")){
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
$app->run();
