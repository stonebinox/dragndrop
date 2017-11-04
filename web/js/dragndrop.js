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
    $scope.itemList=[];
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
                var fileEntry=new Array();
                fileEntry.push(file,properties);
                $scope.itemList.push(fileEntry);
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
        $scope.displayItemList();
    };
    $scope.displayItemList=function(){
        if($scope.itemList.length!=0){
            var items=$scope.itemList.slice();
            var table='<table class="table"><thead><tr><th>File name</th><th>File size</th><th>Actions</th></tr></thead><tbody>';
            for(var i=0;i<items.length;i++){
                var item=items[i];
                var properties=item[1];
                var filesize=properties[1];
                filesize=filesize[1];
                var filename=properties[0][1];
                table+='<tr><td>'+filename+'</td><td>'+filesize+'</td><td><div class="btn-group" id="item'+i+'"><button type="button" class="btn btn-primary btn-xs">Upload</button><button type="button" class="btn btn-default btn-xs">Remove</button></div></td></tr>';
            }
            table+='</tbody></table>';
            $("#itemlist").html(table);
        }
    }
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
                var brandName=stripslashes(brand.brand_name);
                list+='<a href="brand/'+brandID+'" class="list-group-item" data-toggle="tooltip" title="Edit this brand" data-placement="auto">'+brandName+'</a>';
            }
            list+='</div>';
            $("#brandholder").html(list);
            $('[data-toggle="tooltip"]').tooltip({
                trigger: "hover"
            });
        }
    };
    $scope.logout=function(){
        $scope.brand_id=null;
        $scope.brandArray=[];
        window.location='logout';
    };
    $scope.addBrand=function(){
        var text='<form><div class="form-group"><label for="brandname">Brand name</label><input type="text" name="brandname" id="brandname" class="form-control" placeholder="Enter a valid brand name" required></div><div class="form-group"><label for="branddesc">Brand description</label><input type="text" name="branddesc" id="branddesc" class="form-control" placeholder="Enter some description (optional)"></div><div class="text-left"><button type="button" class="btn btn-primary" id="addbrandbut" ng-click="saveBrand()">Add Brand</button></form>';
        messageBox("Add Brand",text);
        $compile("#myModal")($scope);
    };
    $scope.saveBrand=function(){
        var brandName=$.trim($("#brandname").val());
        if(validate(brandName)){
            $("#brandname").parent().removeClass("has-error");
            var brandDesc=$.trim($("#branddesc").val());
            if(!validate(brandDesc)){
                brandDesc='';
            }
            $.ajax({
                url:"saveBrand",
                method: "POST",
                data:{
                    brand_name: brandName,
                    brand_desc: brandDesc
                },
                error:function(err){
                    console.log(err);
                    messageBox("Problem","Something went wrong while processing this request. Please try again later. This is the error we see: "+err.responseText);
                },
                success:function(response){
                    response=$.trim(response);
                    $("#addbrandbut").removeClass("disabled");
                    if((validate(response))&&(response!="INVALID_PARAMETERS")){
                        if(response=="INVALID_USER_ID"){
                            $scope.logout();
                        }
                        else if(response=="INVALID_BRAND_NAME"){
                            messageBox("Invalid Brand Name","Please enter a valid brand name.");
                        }
                        else if(response=="BRAND_ALREADY_EXISTS"){
                            messageBox("Brand Exists","A brand by the same name already exists.");
                        }
                        else if(response=="BRAND_ADDED"){
                            messageBox("Brand Added","Brand was created successfully.");
                            $scope.getBrands();
                        }
                        else{
                            messageBox("Problem","Something went wrong while processing this request. Please try again later. This is the error we see: "+response);    
                        }
                    }
                    else{
                        messageBox("Problem","Something went wrong while processing this request. Please try again later. This is the error we see: "+response);
                    }
                },
                beforeSend:function(){
                    $("#addbrandbut").addClass("disabled");
                }
            });
        }
        else{
            $("#brandname").parent().addClass("has-error");
        }
    };
});
app.controller("campaigns",function($scope,$compile,$http){
    $scope.brandArray=[];
    $scope.brand_id=null;
    $scope.campaignArray=[];
    $scope.getBrand=function(){
        $http.get("getBrand")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.brandArray=response;
                $scope.brand_id=response.idbrand_master;
                var brandName=stripslashes(response.brand_name);
                $("#brandname").html(brandName);
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while loading some information. Please try again later. This is the error we see: "+response);
                    break;
                    case "INVALID_BRAND_ID":
                    window.location='dashboard';
                    break;
                }
            }
        },
        function failure(response){
            messageBox("Problem","Something went wrong while loading some information. Please try again later. This is the error we see: "+response);
        });
    };
    $scope.getCampaigns=function(){
        $http.get("getCampaigns")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.campaignArray=response;
                $scope.displayCampaigns();
            }  
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while loading campaigns for this brand. Please try again later. This is the error we see: "+response);
                    break;
                    case "INVALID_BRAND_ID":
                    window.location='dashboard';
                    break;
                    case "NO_CAMPAIGNS_FOUND":
                    $("#campaignholder").html('No campaigns found. Create one to start.');
                    break;
                }
            }
        },
        function error(response){
            messageBox("Problem","Something went wrong while loading campaigns for this brand. Please try again later. This is the error we see: "+response);
        });
    };
    $scope.displayCampaigns=function(){
        if(validate($scope.campaignArray)){
            var campaigns=$scope.campaignArray;
            var list='<div class="list-group">';
            for(var i=0;i<campaigns.length;i++){
                var campaign=campaigns[i];
                var campaignID=campaign.idcampaign_master;
                var campaignName=stripslashes(campaign.campaign_name);
                list+='<a href="campaign/'+campaignID+'" class="list-group-item" data-toggle="tooltip" title="Edit this campaign" data-placement="auto">'+campaignName+'</a>';
            }
            list+='</div>';
            $("#campaignholder").html(list);
            $('[data-toggle="tooltip"]').tooltip({
                trigger: "hover"
            });
        }
    };
    $scope.addCampaign=function(){
        var text='<form><div class="form-group"><label for="campname">Campaign name</label><input type="text" name="campname" id="campname" class="form-control" placeholder="Enter a valid campaign name" required></div><div class="form-group"><label for="campdesc">Campaign description</label><input type="text" name="campdesc" id="campdesc" class="form-control" placeholder="Enter some description (optional)"></div><div class="text-left"><button type="button" class="btn btn-primary" id="addcampbut" ng-click="saveCampaign()">Add Campaign</button></form>';
        messageBox("Add Campaign",text);
        $compile("#myModal")($scope);
    };
    $scope.saveCampaign=function(){
        var campName=$.trim($("#campname").val());
        if(validate(campName)){
            $("#campname").parent().removeClass("has-error");
            var campDesc=$.trim($("#campdesc").val());
            if(!validate(campDesc)){
                campDesc='';
            }
            $.ajax({
                url:"saveCampaign",
                method: "POST",
                data:{
                    campaign_name: campName,
                    camp_desc: campDesc
                },
                error:function(err){
                    console.log(err);
                    messageBox("Problem","Something went wrong while processing this request. Please try again later. This is the error we see: "+err.responseText);
                },
                success:function(response){
                    response=$.trim(response);
                    $("#addcampbut").removeClass("disabled");
                    if((validate(response))&&(response!="INVALID_PARAMETERS")){
                        if(response=="INVALID_USER_ID"){
                            $scope.logout();
                        }
                        else if(response=="INVALID_CAMPAIGN_NAME"){
                            messageBox("Invalid Campaign Name","Please enter a valid campaign name.");
                        }
                        else if(response=="CAMPAIGN_ALREADY_EXISTS"){
                            messageBox("Campaign Exists","A campaign by the same name already exists.");
                        }
                        else if(response=="CAMPAIGN_ADDED"){
                            messageBox("Campaign Added","Campaign was created successfully.");
                            $scope.getCampaigns();
                        }
                        else{
                            messageBox("Problem","Something went wrong while processing this request. Please try again later. This is the error we see: "+response);    
                        }
                    }
                    else{
                        messageBox("Problem","Something went wrong while processing this request. Please try again later. This is the error we see: "+response);
                    }
                },
                beforeSend:function(){
                    $("#addcampbut").addClass("disabled");
                }
            });
        }
        else{
            $("#campname").parent().addClass("has-error");
        }
    };
});