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
    return $app['twig']->render("login.twig");
});
$app->run();
