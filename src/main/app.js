/**
 * Created by hyj on 2016/9/28.
 */

import React,  {
    Component,
    PropTypes
    }from "react";
import ReactDOM from "react-dom";
import classNames from 'classnames';
import Foot from "../foot/foot"
import Head from "../head/head"
import Activateview from "../container/activateview/activateview"
import Uploadview from "../container/Uploadview/Uploadview"
import Stationview from "../container/stationview/stationview"
import './App.css';

import fetch from 'isomorphic-fetch';
require('es6-promise').polyfill();


var winWidth;
var winHeight;
var Longitude = null;
var Latitude = null;
var basic_address = getRelativeURL()+"/";
var request_head= basic_address+"request.php";
class App extends Component{
    constructor(props) {
        super(props);
        this.state = {
            width: 1280, //
            height: 800,
            headfootheight: 50,
            headfootminheight: 50,
            canvasheight: 700,
            userid: "user",
            username:"Activate",
            hculist: []
        };
    }
    initializeSize(width,height){
        let winlength= (width>height)?width:height;
        let headfootheight = (parseInt(winlength/10)>this.state.headfootminheight)?parseInt(winlength/10):this.state.headfootminheight;
        let canvasheight = height - 2*headfootheight;
        console.log("headfootheight:"+headfootheight+"canvasheight:"+canvasheight);
        this.setState({width:width,height:height,headfootheight:headfootheight,canvasheight:canvasheight});
        this.refs.head.update_size(headfootheight);
        this.refs.foot.update_size(headfootheight);
        this.refs.Activateview.update_size(width,canvasheight);
        this.refs.Uploadview.update_size(width,canvasheight);
        this.refs.Stationview.update_size(width,canvasheight);
    }
    initializehead(id){
        this.refs.head.update_username(id);
    }
    initializefoot(callback){
        this.refs.foot.update_callback(callback);
    }
    initializestation(projlist,statlist,callback){
        this.refs.Stationview.update_freestationlist(statlist);
        this.refs.Stationview.update_projlist(projlist);
        this.refs.Stationview.updatecallback(callback);
    }
    getSelectedStat(){
        return this.refs.Stationview.getSelectedStat();
    }
    updateactivestatus(status){
        this.refs.Activateview.update_status(status);
    }
    updateactivecode(code){
        this.refs.Activateview.update_code(code);
    }
    updateactivenotes(notes){
        this.refs.Activateview.update_notes(notes);
    }
    showactiveview(){
        this.refs.Stationview.hide();
        this.refs.Uploadview.hide();
        this.refs.Activateview.show();
    }
    showuploadview(){
        this.refs.Stationview.hide();
        this.refs.Activateview.hide();
        this.refs.Uploadview.show();
    }
    showstationview(){
        this.refs.Stationview.show();
        this.refs.Activateview.hide();
        this.refs.Uploadview.hide();
    }
    buttonlock(input){
        this.refs.foot.disable(input);
    }
    render() {
        return(
        <div>
            <div>
                <Head ref="head"/>
            </div>
            <div>
                <Uploadview ref="Uploadview"/>
                <Activateview ref="Activateview"/>
                <Stationview ref="Stationview"/>
            </div>
            <div>
                <Foot ref="foot"/>
            </div>
        </div>
        );
    }


}




get_size();
var project_list = [];
var free_station =[];

//fetchFreeStation();

var wechat_id = getWechatScope();
var react_element = <App/>;
var app_handle = ReactDOM.render(react_element,document.getElementById('app'));
var cycle_number = 0;
var Intervalhandle;
var basic_address = getRelativeURL()+"/";
var upload_url=basic_address+"upload.php";
fetchProjectList();
$('#file-zh').fileinput({
    language: 'zh',
    uploadUrl: upload_url+"?id="+wechat_id,
    allowedFileExtensions : ['jpg','jpeg','JPG' ,'JPEG','png','PNG'],
    showPreview : true,
    maxFileSize:5000
});
//app_handle.initializebuttonlock(lockbuttoncallback);
//app_handle.initializeUrl(request_head);
app_handle.initializeSize(winWidth,winHeight);
app_handle.updateactivecode(wechat_id);
app_handle.initializehead(wechat_id);
//app_handle.showuploadview();
app_handle.showstationview();
getLocation();



function get_size(){
    if (window.innerWidth)
        winWidth = window.innerWidth;
    else if ((document.body) && (document.body.clientWidth))
        winWidth = document.body.clientWidth;
    if (window.innerHeight)
        winHeight = window.innerHeight;
    else if ((document.body) && (document.body.clientHeight))
        winHeight = document.body.clientHeight;
    if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
    {
        winHeight = document.documentElement.clientHeight;
        winWidth = document.documentElement.clientWidth;
    }
    console.log("winWidth = "+winWidth);
    console.log("winHeight= "+winHeight);
}

function GetRandomNum(Min,Max)
{
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}

function getRelativeURL(){
    var url = document.location.toString();
    var arrUrl= url.split("//");
    var start = arrUrl[1].indexOf("/");
    var reUrl=arrUrl[1].substring(start);
    if(reUrl.indexOf("?")!=-1) {
        reUrl = reUrl.split("?")[0];
    }
    var end = reUrl.lastIndexOf("/");
    reUrl=reUrl.substring(0,end);
    return reUrl;
}
function getLocation()
{
    //alert("正在获取位置！");
    app_handle.updateactivenotes("正在获取位置！");
    /*
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        app_handle.showactiveview();
        app_handle.updateactivenotes("无法获得当前位置！");
        alert("无法获得当前位置！");
    }*/

    let bmap = new BMap.Map("GuildMap");
    var t_point = new BMap.Point(116.501573, 39.900877);
    bmap.centerAndZoom(t_point,15);
    var geoc = new BMap.Geocoder();
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function(r){
        if(this.getStatus() == BMAP_STATUS_SUCCESS){
            let coords = {
                latitude:r.point.lat ,longitude:r.point.lng
            }
            let postion = {
                coords:coords
            }
            showPosition(postion);
            //var mk = new BMap.Marker(r.point);
            //map.addOverlay(mk);
            //map.panTo(r.point);
            //$("#start_point").val(r.point.lng+','+r.point.lat);
            //alert("当前位置经度为:"+r.point.lng+"纬度为:"+r.point.lat);
        }else {
            console.log("无法获得当前位置！");
            alert("无法获得当前位置！");
        }
    },{enableHighAccuracy: true});
}
function showPosition(position)
{
    //alert("获取位置！");

    //var TO_BLNG = function(lng){return lng+0.0065;};

    //var TO_BLAT = function(lat){return lat+0.0060;};

    //var TO_GLNG = function(lng){return lng-0.0065;};

    //var TO_GLAT = function(lat){return lat-0.0060;};
    console.log("Latitude: " + position.coords.latitude +
        "Longitude: " + position.coords.longitude);
    //Latitude = TO_BLAT(position.coords.latitude);
    //Longitude = TO_BLNG(position.coords.longitude);
    Latitude = (position.coords.latitude);
    Longitude = (position.coords.longitude);
    //fetchactivate();

    Intervalhandle= setInterval(function() {
        if(cycle_number >=100) return;
        fetchactivate();
        cycle_number++;
    }, 3000);
}
function query_callback(res){
    if(res.jsonResult.status == "false"){
        //app_handle.updateactivestatus(false);
        //app_handle.updateactivenotes("激活失败:"+res.jsonResult.msg);
        return;
    }
    if(res.jsonResult.auth == "false"){
        app_handle.updateactivestatus(false);
        app_handle.updateactivenotes("激活失败:"+res.jsonResult.msg);
        cycle_number = 101;
        return;
    }
    app_handle.showactiveview();
    app_handle.updateactivestatus(true);
    app_handle.updateactivenotes("设备已激活！");
    //alert("设备已激活！");
    cycle_number = 101;
    return;

}
function jsonParse(res) {
    return res.json().then(jsonResult => ({ res, jsonResult }));
}
function fetchactivate(){
    //console.log(app_handle.getSelectedStat());
    if(app_handle.getSelectedStat() == "--") return;
    let body={
        code:wechat_id,
        StatCode:app_handle.getSelectedStat(),
        latitude:""+Latitude,
        longitude:""+Longitude
    };
    let listreq = {
        action:"HCU_Lock_Activate",
        body:body,
        type:"query",
        user:"activeuser"
    };
    fetch(request_head,
        {
            method:'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(listreq)
        }).then(jsonParse)
        .then(query_callback)
        .catch( (error) => {
            console.log('request error', error);
            return { error };
        });
}

function fetchProjectList(){
    var listreq={
        action:"ProjectList",
        type:"query",
        user:"activeuser"
    };
    fetch(request_head,
        {
            method:'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(listreq)
        }).then(jsonParse)
        .then(fetchProjectListcallback)
        .catch( (error) => {
            console.log('request error', error);
            return { error };
        });
}
function fetchProjectListcallback(res){
    project_list = res.jsonResult.ret;
    fetchFreeStation();
    return;

}
function fetchFreeStation(){
    var listreq={
        action:"HCU_Get_Free_Station",
        type:"query",
        user:"activeuser"
    };
    fetch(request_head,
        {
            method:'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(listreq)
        }).then(jsonParse)
        .then(fetchFreeStationcallback)
        .catch( (error) => {
            console.log('request error', error);
            return { error };
        });
}
function changeview(){
    app_handle.showuploadview();
}
function fetchFreeStationcallback(res){
    free_station = res.jsonResult.ret;
    //console.log(free_station);
    //console.log(project_list);
    app_handle.initializestation(project_list,free_station,changeview);
    return;

}
function getWechatScope(){
    var url = document.location.toString();
    if(url.indexOf("code=")!=-1){
        var arrUrl= url.split("code=");
        var scope_value = arrUrl[1].split("&")[0];
        //log("code="+scope_value);
        if(scope_value.length>0 ){
            return scope_value;
        }
    }
    return "test";
}