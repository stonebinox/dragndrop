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
app.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});
app.controller('dd', function($scope,$compile,$http){
    $scope.itemList=[];
    $scope.pastItemList=[];
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
                            var width=$("#imgprev").naturalWidth;
                            var height=$("#imgprev").naturalHeight;
                            var prop=["Width X Height",width+'x'+height+' px'];
                            properties.push(prop);
                            $('#imgprev')
                                .attr('src', e.target.result)
                                .addClass("img-responsive")
                                .css("width","60%");
                            //$scope.renderProperties(properties);
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
                                document.getElementById("videoplayer").addEventListener( "loadedmetadata", function (e) {
                                    var width=document.getElementById("videoplayer").videoWidth;
                                    var height=document.getElementById("videoplayer").videoHeight;
                                    prop=["Width X Height", width+'x'+height+' px'];
                                    properties.push(prop);
                                    $scope.renderProperties(properties);
                                }, false );
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
    $scope.showDescriptionForm=function(itemID){
        var text='<form><div class="form-group"><label for="desc">Description</label><textarea name="desc" id="desc" placeholder="Enter a description for this file" class="form-control"></textarea></div><button type="button" class="btn btn-primary" ng-click="saveDescription('+itemID+')">Update</button></form>';
        messageBox("Add Description",text);
        $compile("#myModal")($scope);
    };
    $scope.saveDescription=function(itemID){
        var desc=$.trim($("#desc").val());
        if(validate(desc)){
            $("#desc").parent().removeClass("has-error");
            $.ajax({
                url: 'saveDescription',
                data:{
                    item_id: itemID,
                    description: desc
                },
                method: "POST",
                success: function(response){
                    if((validate(response))&&(response!="INVALID_PARAMETERS")){ 
                        response=$.trim(response);
                        if(response=="INVALID_ITEM_ID"){
                            messageBox("Invalid File","The file you are working on is invalid.");
                        }
                        else if(response=="ITEM_DESCRIPTION_UPDATED"){
                            $("#myModal").modal("hide");
                            $scope.getItems();
                        }
                        else{
                            messageBox("Problem","Something went wrong while saving this description. This is the error we see: "+response);
                        }
                    }
                    else{
                        messageBox("Problem","Something went wrong while trying to save this description.");
                    }
                },
                error: function(response){
                    messageBox("Problem","Something went wrong while trying to save this description.");
                }
            });            
        }
        else{
            $("#desc").parent().addClass("has-error");
        }
    };
    $scope.displayItemList=function(){
        if($scope.itemList.length!=0){
            var items=$scope.itemList.slice();
            var table='<strong>Current list</strong><br><table class="table"><thead><tr><th>File name</th><th>File size</th><th>Actions</th></tr></thead><tbody>';
            for(var i=0;i<items.length;i++){
                var item=items[i];
                var properties=item[1];
                var filesize=properties[1];
                filesize=filesize[1];
                var filename=properties[0][1];
                table+='<tr><td>'+filename+'</td><td>'+filesize+'</td><td><div class="btn-group" id="item'+i+'"><button type="button" class="btn btn-primary btn-xs" ng-click="uploadItem('+i+')">Upload</button><button type="button" class="btn btn-default btn-xs" ng-click="removeItem('+i+')">Remove</button></div></td></tr>';
            }
            table+='</tbody></table>';
            $("#itemlist").html(table);
            $compile("#itemlist")($scope);
        }
        else{
            $("#itemlist").html('<p>No items selected.</p>');
        }
    };
    $scope.removeItem=function(pos){
        $scope.itemList.splice(pos,1);
        $scope.displayItemList();
    };
    $scope.uploadItem=function(pos){
        var item=$scope.itemList[pos];
        var file=item[0];
        var properties=item[1];
        var desc=properties[properties.length-1];
        desc=desc[1];
        var formdata=new FormData();
        formdata.append("items",file);
        formdata.append("description",desc);
        if(validate(file)){
            $.ajax({
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100);
                            $("#progress"+pos).css("width",percentComplete+"%");
                            if (percentComplete === 100) {
                                $("#item"+pos).html('<p class="text-info">Please wait ...</p>');
                            }
                        }
                    }, false);
                    return xhr;
                },
                url: 'uploadItem',
                method: 'POST',
                data: formdata,
                processData:false,
                contentType: false,
                cache: false,
                success:function(response){
                    response=$.trim(response);
                    if((validate(response))&&(response!="INVALID_PARAMETERS")){
                        if(response=="UPLOAD_ERROR"){
                            messageBox("Upload Error","The file could not be uploaded. Please check with the admins and try again.");
                        }
                        else if(response=="INVALID_CAMPAIGN_ID"){
                            window.location='brandView';
                        }
                        else if(response=="ITEM_ADDED")
                        {
                            $("#item"+pos).html('<p class="text-success">Uploaded</p>');
                            $scope.getItems();
                        }
                        else{
                            messageBox("Upload Error","Something went wrong while uploading this file. Please try again later. This is the error we see: "+response);
                        }
                    }
                    else{
                        messageBox("Upload Error","Something went wrong while uploading this file. Please try again later.");
                    }
                },
                error:function(response){
                    console.log(response);
                    messageBox("Network Error","Something went wrong while uploading this file. Please try again later.");
                },
                beforeSend:function(){
                    $("#item"+pos).html('<div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%" id="progress'+pos+'"></div></div>');
                }
            });
        }
    };
    $scope.getItems=function(){
        $http.get("getItems")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.pastItemList=response;
                $scope.displayPastItems();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while loading past uploaded items. Please try again later.");
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while loading past uploaded items. Please try again later.");
        });
    };
    $scope.displayPastItems=function(){
        var table='<strong>Past Uploaded Items</strong><br><table class="table"><thead><tr><th>Name</th><th>Description</th><th>Uploaded on</th><th>Actions</th></tr></thead><tbody>';
        var pastItems=$scope.pastItemList;
        for(var i=0;i<pastItems.length;i++){
            var item=pastItems[i];
            var itemID=item.iditem_master;
            var timestamp=item.timestamp;
            var sp=timestamp.split(" ");
            timestamp=dateFormat(sp[0])+' at '+sp[1];
            var itemPath=item.item_path;
            var itemName=item.item_name;
            var approveFlag=item.approval_flag;
            var description=item.item_description;
            if(validate(description)){
                description=$.trim(nl2br(description));
            }
            else{
                description='No description added';
            }
            table+='<tr><td><a href="'+itemPath+'" target="_blank">'+itemName+'</a></td><td>'+description+'</td><td>'+timestamp+'</td><td><div class="btn-group">';
            if(approveFlag==1){
                table+='<button type="button" class="btn btn-success btn-xs">Approved</button>';
            }
            else if(approveFlag==2){
                table+='<button type="button" class="btn btn-danger btn-xs">Rejected</button>';
            }
            else{
                table+='<button type="button" class="btn btn-warning btn-xs">Under Review</button>';
            }
            table+='<button type="button" class="btn btn-info btn-xs" ng-click="showDescriptionForm('+itemID+')">Edit description</button><button type="button "class="btn btn-danger btn-xs">Delete</button></div></tr>';
        }
        table+='</tbody></table>';
        $("#pastitemlist").html(table);
        $compile("#pastitemlist")($scope);
    };
    $scope.showShare=function(url){
        var text='<div class="panel panel-default"><div class="panel-body">'+url+'</div></div>';
        messageBox("Copy This URL",text);
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
            var list='<ul class="list-group">';
            for(var i=0;i<brands.length;i++){
                var brand=brands[i];
                var brandID=brand.idbrand_master;
                var brandName=stripslashes(brand.brand_name);
                var description=stripslashes(brand.brand_description);
                if(!(validate(description))){
                    description='';
                }
                list+='<li class="list-group-item"><a href="brand/'+brandID+'" data-toggle="tooltip" title="Edit this brand" data-placement="auto">'+brandName+'</a>&nbsp;&bull;&nbsp;<span class="small text-info">'+description+'</span></li>';
            }
            list+='</ul>';
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
            var list='<ul class="list-group">';
            for(var i=0;i<campaigns.length;i++){
                var campaign=campaigns[i];
                var campaignID=campaign.idcampaign_master;
                var campaignName=stripslashes(campaign.campaign_name);
                var description=stripslashes(campaign.campaign_description);
                if(!validate(description)){
                    description='';
                }
                list+='<li class="list-group-item"><a href="campaign/'+campaignID+'" data-toggle="tooltip" title="Edit this campaign" data-placement="auto">'+campaignName+'</a>&nbsp;&bull;&nbsp;<span class="small text-info">'+description+'</span>&nbsp;&nbsp;<span class="glyphicon glyphicon-share" style="cursor:pointer;" ng-click="showShareForm('+campaignID+')" data-toggle="tooltip" title="Share this campaign" data-placement="auto"></span></li>';
            }
            list+='</ul>';
            $("#campaignholder").html(list);
            $compile("#campaignholder")($scope);
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
    $scope.showShareForm=function(campaignID){
        var text='<p>You can share this campaign for a creative agent to review the files uploaded. Please ensure that the email ID you enter has <i>already</i> signed up as a creative agent.</p><hr><form name="shareCamp"><div class="form-group"><label for="email">Email ID</label><input type="email" name="email" id="email" required placeholder="Enter a valid email ID" class="form-control"><input type="hidden" name="campaign_id" value="'+campaignID+'"></div><button type="button" class="btn btn-primary" ng-click="shareCampaign()">Share</button></form>';
        messageBox("Share Campaign",text);
        $compile("#myModal")($scope);
    };
    $scope.shareCampaign=function(){
        var campaignID=document.shareCamp.campaign_id.value;
        var email=$.trim($("#email").val());
        if(validate(email)){
            $("#email").parent().removeClass("has-error");
            $http.get("shareCampaign?campaign_id="+campaignID+"&email="+email)
            .then(function success(response){
                response=$.trim(response.data);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while sharing this campaign. Please try again later. This is the error we see: "+response);
                    break;
                    case "INVALID_USER_EMAIL":
                    messageBox("Invalid Email","Please enter a valid email ID and try again.");
                    break;
                    case "INVALID_USER_ID":
                    messageBox("Invalid User","The user you are trying to share with doesn't exist any more.");
                    break;
                    case "INVALID_CAMPAIGN_ID":
                    messageBox("Invalid Campaign","The campaign you are trying to share is no longer valid. Please refresh the page and try again.");
                    break;
                    case "INVALID_ADMIN_TYPE":
                    messageBox("Cannot Share","Campaigns can be shared only with users who are creative agents.");
                    break;
                    case "CAMPAIGN_ALREADY_SHARED":
                    messageBox("Already Shared","This campaign was already shared with this email ID.");
                    break;
                    case "CAMPAIGN_SHARED":
                    messageBox("Campaign Shared","The campaign was shared successfully.");
                    break;
                }
            },
            function error(response){
                console.log(response);
                messageBox("Problem","Something went wrong while sharing this campaign. Please try again later.");
            });
        }
        else{
            $("#email").parent().addClass("has-error");
        }
    };
});
app.controller("agents",function($scope,$compile,$http){
    $scope.shareArray=[];
    $scope.logout=function(){
        $scope.shareArray.length=[];
        window.location='logout';
    };
    $scope.getSharedCampaigns=function(){
        $http.get("getSharedCampaigns")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.shareArray=response;
                $scope.displaySharedCampaigns();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    case "INVALID_USER_ID":
                    default:
                    $scope.logout();
                    break;
                    case "NO_SHARED_CAMPAIGNS_FOUND":
                    $("#campaignholder").html("No campaigns have been shared with you.");
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong. Try again later.");
        });
    };
    $scope.displaySharedCampaigns=function(){
        var sharedCampaigns=$scope.shareArray;
        var list='<ul class="list-group">';
        $scope.shareCount=sharedCampaigns.length;
        for(var i=0;i<sharedCampaigns.length;i++){
            var share=sharedCampaigns[i];
            var shareID=share.idshare_master;
            var campaign=share.campaign_master_idcampaign_master;
            var user=share.user_master_iduser_master;
            var timestamp=share.timestamp;
            var campaignName=stripslashes(campaign.campaign_name);
            var campaignID=campaign.idcampaign_master;
            var campaignDescription=stripslashes(campaign.campaign_description);
            if(!validate(campaignDescription)){
                campaignDescription='';
            }
            list+='<li class="list-group-item"><a href="campaign/'+campaignID+'">'+campaignName+'</a>&nbsp;&bull;&nbsp;<span class="text-info small">'+campaignDescription+'</span></li>';
        }
        list+='</ul>';
        $("#campaignholder").html(list);
    };
    $scope.itemList=[];
    $scope.getItems=function(){
        $http.get("../getItems")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.itemList=response;
                $scope.displayItems();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while loading uploaded items. Please try again later.");
                    break;
                    case "NO_IMAGES_FOUND":
                    $("#itemlist").html("No files found.");
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while loading uploaded items. Please try again later.");
        });
    };
    $scope.displayItems=function(){
        var table='<table class="table"><thead><tr><th>Name</th><th>Description</th><th>Details</th><th>Uploaded on</th><th>Actions</th></tr></thead><tbody>';
        var pastItems=$scope.itemList;
        $scope.itemCount=pastItems.length;
        for(var i=0;i<pastItems.length;i++){
            var item=pastItems[i];
            var itemID=item.iditem_master;
            var itemPath=item.item_path;
            var timestamp=item.timestamp;
            var sp=timestamp.split(" ");
            timestamp=dateFormat(sp[0])+' at '+sp[1];
            var itemName=item.item_name;
            var approveFlag=item.approval_flag;
            var description=item.item_description;
            if(validate(description)){
                description=$.trim(nl2br(description));
            }
            else{
                description='No description';
            }
            table+='<tr><td><a href="'+itemPath+'" target="_blank">'+itemName+'</a></td><td>'+description+'</td><td id="'+itemID+'details">Loading ...</td><td>'+timestamp+'</td><td><div class="btn-group"><button type="button" class="btn btn-success btn-xs';
            if(approveFlag==1){
                table+=' active';
            }
            table+='" ng-click="approveFile('+itemID+')">Approve</button><button type="button" class="btn btn-danger btn-xs';
            if(approveFlag==2){
                table+=' active';
            }
            table+='" ng-click="rejectFile('+itemID+')">Reject</button></div></tr>';
        }
        table+='</tbody></table>';
        $("#itemlist").html(table);
        $compile("#itemlist")($scope);
        $scope.getDimensions(0);
    };
    $scope.getDimensions=function(pos){
        if(pos<$scope.itemList.length){
            var item=$scope.itemList[pos];
            var itemID=item.iditem_master;
            var itemPath=item.item_path;
            var rev=itemPath.split("").reverse().join("");
            var sp=rev.split(".");
            var ext=$.trim(sp[0]);
            ext=ext.split("").reverse().join("");
            ext=ext.toLowerCase();
            if((ext=="jpg")||(ext=="jpeg")||(ext=="png")||(ext=="bmp")){
                var img=new Image();
                img.src=itemPath;
                img.onload=function(){
                    var width=img.naturalWidth;
                    var height=img.naturalHeight;
                    $("#"+itemID+"details").html(width+'x'+height);
                };
            }
            else if((ext=="mp4")||(ext=="ogg")||(ext=="flv")){
                $("#"+itemID+"details").html('<video id="'+itemID+'video" src="'+itemPath+'" style="display:none;"></video>');
                var video=document.getElementById(itemID+"video");
                video.onload=function(){
                    var width=video.videoWidth;
                    var height=video.videoHeight;
                    $("#"+itemID+"details").html(width+'x'+height);
                }
            }
            else{
                $("#"+itemID+"details").html("NA");
            }
            pos+=1;
            $scope.getDimensions(pos);
        }
    };
    $scope.approveFile=function(itemID){
        $http.get("approveItem?item_id="+itemID)
        .then(function success(response){
            response=$.trim(response.data);
            switch(response){
                case "INVALID_PARAMETERS":
                default:
                messageBox("Problem","Something went wrong while approving this file. Please try again later. This is the error we see: "+response);
                break;
                case "INVALID_ITEM_ID":
                messageBox("Invalid File","The file you are working with is invalid or doesn't exist.");
                break;
                case "ITEM_APPROVED":
                messageBox("Item Approved","The item was approved successfully.");
                $scope.getItems();
                break;
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while approving this item. Please try again later.");
        });
    };
    $scope.rejectFile=function(itemID){
        $http.get("rejectItem?item_id="+itemID)
        .then(function success(response){
            response=$.trim(response.data);
            switch(response){
                case "INVALID_PARAMETERS":
                default:
                messageBox("Problem","Something went wrong while rejecting this file. Please try again later. This is the error we see: "+response);
                break;
                case "INVALID_ITEM_ID":
                messageBox("Invalid File","The file you are working with is invalid or doesn't exist.");
                break;
                case "ITEM_REJECTED":
                messageBox("Item Rejected","The item was rejected successfully.");
                $scope.getItems();
                break;
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while rejecting this item. Please try again later.");
        });
    };
});