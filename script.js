
let video = document.querySelector("video");// select the video tags
let vidBtn = document.querySelector("button#record");//video ka button
let capBtn = document.querySelector("button#capture");//image click ka button

let filters = document.querySelectorAll(".filters");

let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");

let body = document.querySelector("body");

// let audio = document.querySelector("audio");
//let btn = document.querySelector("button");

let constraints = {video:true, audio:true};
let mediaRecorder;
let isRecording = false;
let chunks = []; // its an array which will store recorded data in chunks

let minZoom = 1;
let maxZoom = 3;
let currZoom = 1;

let filter = "";

for(let i = 0; i < filters.length; i++)
{
    filters[i].addEventListener("click", function(e){
        filter = e.currentTarget.style.backgroundColor;
        removeFilter();
        applyFilter(filter);
    });
}

zoomIn.addEventListener("click", function(){
    let vidCurrScale = video.style.transform.split("(")[1].split(")")[0];
    if(vidCurrScale > maxZoom)
    {
        return;
    }
    else {
        currZoom = Number(vidcurrScale) + 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
})

zoomOut.addEventListener("click",function(){
    if(currZoom > minZoom)
    {
        currZoom -= 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

vidBtn.addEventListener("click",function() {
    let innerDiv = vidBtn.querySelector("div");// recording button ka innerDiv nikalo

    if(isRecording){
        mediaRecorder.stop();
        isRecording = false;
        innerDiv.classList.remove("record-animation");//agar record-animation class lagi hai to remove kardo
    } else {
        mediaRecorder.start();
        filter="";//jab hum recording start kar rahe hai to jo bhi filter laga rakhi hai usse hum nikla dalenge
        removeFilter();
        isRecording = true;
        innerDiv.classList.add("record-animation");// aur agar class nahi hai to add kardo
    }
});

capBtn.addEventListener("click",function(){
    let innerDiv = capBtn.querySelector("div");
    innerDiv.classList.add("capture-animation");
    setTimeout(function() {
        innerDiv.classList.remove("capture-animation");// seTimeout lagake class nikalni zaroori hai taki hamesha class 
        // lagi na rahe + animation hone ke baad remove karenge varna to add karte hi remove kar di to anmtn dekegi nahi
    },500);
    capture();
})


// navigator is an object in Browser which has another object mediadevices which has function getUserMedia
// This function takes constraints object
navigator.mediaDevices.getUserMedia(constraints)
.then(function(mediaStream){
    // mediaStream is an Object the object contains live stream of camera or mic
    video.srcObject = mediaStream;// so video tag has srcObject and we are assigning that mediaStream object to video tag
    //audio.srcObject = mediaStream;// so video or audio both will get provided as src to video tag and we can see Livestream

    // we assign MediaRecorder Object to mediaRecorder variable
    mediaRecorder = new MediaRecorder(mediaStream);//MediaRecorder is an object which receives mediaStream object

    // mediaRecorder par MediaRecorder ka object store store karne se hum uspar eventListener laga sakte hai
    // dataavilable is an event of MediaRecorder that gets triggered when we press Record button but after someTime
    mediaRecorder.addEventListener("dataavailable",
    function(e){
        // chunks ke array me data turant nahi jata kuch der bad jab space bharne lagti hai tab jata hai
        chunks.push(e.data);
    });

    // MediaRecorder also has stop event which triggered when stop recording
    mediaRecorder.addEventListener("stop", function(){
        let blob = new Blob(chunks, {type: "video/mp4"});//Blob is like function of Blob class which takes two arguments chunks(what to make) and type in which you want

        chunks = [];

        let url = URL.creatObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        a.download = "video.mp4";
        a.click();
        a.remove();
    });

});
//capture buttob click kar ne par image draw hone chaiye aur image canvas pe draw hogi
function capture(){
    let c = document.createElement("canvas");//to phele canvas ban lo
    c.width = video.videoWidth;//ab canvas ki height aur width utni hogi jitni width aur height se video play ho rahi hai
    c.height = video.videoHeight;
    let ctx = c.getContext("2d");

    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(currZoom,currZoom);
    ctx.translate(-c.width / 2, -c.height / 2);

    ctx.drawImage(video,0,0);// whatever frame is in video at that time is given to this function

    if(filter != "")
    {
        ctx.fillStyle = filter;
        ctx.fillRect(0,0,c.width,c.height);
    }
    let a = document.createElement("a");
    a.download = "image.jpg";
    a.href = c.toDataURL();// gives url to image so we can download 
    a.click();
    a.remove();
}

function applyFilter(filterColor)
{
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    body.appendChild(filterDiv);
}

function removeFilter(){
    let filterDiv = document.querySelector(".filter-div");
    if(filterDiv)
    filterDiv.remove();
}