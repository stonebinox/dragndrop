function verifyFile(){
    angular.element(document.getElementById('filepicker')).scope().verifyFile();
}
function allowDrop(e){
    e.preventDefault();
}
function drop(e){
    e.preventDefault();
    angular.element(document.getElementById('filepicker')).scope().drop(e);
}
var app=angular.module("dragndrop",[]);
app.controller('dd', function($scope,$compile){
    $scope.drop=function(e){
        var data=e.dataTransfer.files;
        $scope.verifyFile(data);
    };
    $scope.pickFile=function(){
        $("#file").trigger("click");
    };
    $scope.verifyFile=function(data){
        if((data!=null)&&(data!=undefined)){
            var file=data[0];
            var filename=$.trim(file.name);
        }
        else{
            var file=$("#file")[0].files[0];
            var filename=$.trim($("#file").val());
        }
        if((filename!="")&&(filename!=null)){
            var sp=filename.split('\\');
            filename=sp[sp.length-1];
            var properties=[];
            var arr=["File name",filename];
            properties.push(arr);
            $("#file").val('');
            var rev=filename.split("").reverse().join("");
            sp=rev.split(".");
            var ext=sp[0].split("").reverse().join("");
            var filesize=file.size;
            filesize=Math.round(filesize/1024);
            var permit=true;
            switch(ext.toLowerCase()){
                case "jpg":
                case "jpeg":
                case "png":
                case "gif":
                case "bmp":
                    if($scope.images){
                        var thumbnail=document.createElement("div");
                        $(thumbnail).addClass("thumbnail text-center");
                            var a=document.createElement("a");
                            $(a).attr("href","#");
                                var img=document.createElement("img");
                                $(img).attr("id","imgprev");
                                $(a).append(img);
                                var caption=document.createElement("div");
                                $(caption).addClass("caption");
                                    var p=document.createElement("p");
                                    $(p).html(filename);
                                    $(caption).append(p);
                                $(a).append(caption);
                            $(thumbnail).append(a);
                        $("#filedetails").html(thumbnail);
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            $('#imgprev')
                                .attr('src', e.target.result)
                                .addClass("img-responsive")
                                .css("width","60%");
                        };
                        reader.readAsDataURL(file);
                    }
                    else{
                        permit=false;
                    }
                break;
                case "mp3":
                case "wav":
                case "wmv":
                case "ogg":
                    if($scope.music){
                        var audio=document.createElement("audio");
                        $(audio).attr("controls","true");
                        $(audio).attr("id","audioplayer");
                        $("#filedetails").html(audio);
                        $(audio).css("border","1px solid #cccccc");
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var source=document.createElement("source");
                            $(source).attr("src",e.target.result);
                            $(source).attr("type","audio/"+ext);
                            $("#audioplayer").append(source);
                            $("#audioplayer").bind('canplay', function(){
                                var duration=this.duration;
                                var min=parseInt(duration/60);
                                var sec=parseInt(duration%60);
                                var prop=["Duration",min+":"+sec];
                                properties.push(prop);
                                $scope.renderProperties(properties);
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                    else{
                        permit=false;
                    }
                break;
                case "mp4":
                case "flv":
                case "webm":
                    if($scope.videos){
                        var video=document.createElement("video");
                        $(video).attr("controls","true");
                        $(video).attr("id","videoplayer");
                        $("#filedetails").html(video);
                        $(video).css("border","1px solid #cccccc");
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var source=document.createElement("source");
                            $(source).attr("src",e.target.result);
                            $(source).attr("type","video/"+ext);
                            $("#videoplayer").append(source);
                            $("#videoplayer").bind('canplay', function(){
                                var duration=this.duration;
                                var min=parseInt(duration/60);
                                var sec=parseInt(duration%60);
                                var prop=["Duration",min+":"+sec];
                                properties.push(prop);
                                $scope.renderProperties(properties);
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                    else{
                        permit=false;
                    }
                break;
                default:
                    if($scope.docs){
                        //do nothing
                    }
                    else{
                        permit=false;
                    }
                break;
            }
            if($scope.filesize>-1){
                if(filesize>($scope.filesize*1024)){
                    permit=false;
                }
            }
            if(permit){
                if(filesize>1024){
                    filesize=filesize/1024;
                    filesize+=" MB";
                }
                else{
                    filesize+=' KB';
                }
                arr=["File size",filesize];
                properties.push(arr);
                arr=["File type",ext];
                properties.push(arr);
                //var properties=[["File name",filename],["File size",filesize],["File type",ext]];
                var table=document.createElement("table");
                $(table).addClass("table");
                    var thead=document.createElement("thead");
                        var tr1=document.createElement("tr");
                            var th1=document.createElement("th");
                            $(th1).html("Property");
                            $(tr1).append(th1);
                            var th2=document.createElement("th");
                            $(th2).html("Value");
                            $(tr1).append(th2);
                        $(thead).append(tr1);
                    $(table).append(thead);
                    var tbody=document.createElement("tbody");
                    $(tbody).attr("id","prop-table");
                    $(table).append(tbody);
                $("#filedetails").append(table);
                $scope.renderProperties(properties);
            }
            else{
                $("#filedetails").html('<div class="alert alert-danger"><strong>Invalid File</strong> This file cannot be uploaded. It could be a file type that is not permitted or it could be bigger than the specified file size limit.</div>');
            }
        }
    };
    $scope.renderProperties=function(properties){
        $("#prop-table").html('');
        for(var i=0;i<properties.length;i++){
            var property=properties[i];
            var propertyName=property[0];
            var propertyValue=property[1];
            var tr2=document.createElement("tr");
            var td1=document.createElement("td");
            $(td1).addClass("text-left");
            $(td1).html(propertyName);
            $(tr2).append(td1);
            var td2=document.createElement("td");
            $(td2).addClass("text-left");
            $(td2).html(propertyValue);
            $(tr2).append(td2);
            $("#prop-table").append(tr2);
        }
    };
});
app.controller("brands",function($scope,$compile,$http){
    $scope.brand_id=null;
    $scope.brandArray=[];
    $scope.getBrands=function(){
        $http.get('getBrands')
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.brandArray=response;
                $scope.displayBrands();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while getting the list of brands. Please try again later. This is the error we see: "+response);
                    break;
                    case "NO_BRANDS_FOUND":
                    $("#brandholder").html('No brands found. Create one to start.');
                    break;
                }

            }
        },
        function failure(response){
            messageBox("Problem","Something went wrong while getting the list of brands. Please try again later. This is the error we see: "+response);
        });
    };
    $scope.displayBrands=function(){
        if(validate($scope.brandArray)){
            var brands=$scope.brandArray;
            var list='<div class="list-group">';
            for(var i=0;i<brands.length;i++){
                var brand=brands[i];
                var brandID=brand.idbrand_master;
                var brandName=stripslahses(brand.brand_name);
                list+='<a href="#" class="list-group-item">'+brandName+'</a>';
            }
            list+='</div>';
            $("#brandholder").html(list);
        }
    };
    $scope.logout=function(){
        $scope.brand_id=null;
        $scope.brandArray=[];
        window.location='logout';
    };
});