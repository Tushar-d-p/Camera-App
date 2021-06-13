let dbAccess;
let request = indexedDB.open("Camera",1); // Camera name ka database kholdo version 1 ka
let container = document.querySelector(".container");


request.addEventListener("success",function(){
    dbAccess = request.result;// success event hone par dbAccess store kardo
});

request.addEventListener("upgradeneeded",function(){
    let db = request.result;
    db.createObjectStore("gallery",{ keyPath: "mId"});
});

request.addEventListener("error",function(){
    alert("some error occured");
})

// jab hum image capture/video capture karte hai tab database mei store karne ke liye iss func ko chalate hai
function addMedia(type,media)
{
    let tx = dbAccess.transaction("gallery","readwrite");// gallery name ke ObjectStote/table par readwrite ka transaction kholo
    let galleryObjectStore = tx.objectStore("gallery");// table accquire karo
    let data = {
        mId: Date.now(),
        type,
        media,
    };
    galleryObjectStore.add(data);//data banao aur data store karo
}

//Databasee main se img/video UI pe show aur delete karne ke liye yeh function hai
function viewMedia(){
    let tx = dbAccess.transaction("gallery","readonly");// pehle to database ke sath transaction kholdo gismese read karna hai
    let galleryObjectStore = tx.objectStore("gallery");// wo objectStore/table nikkalo
    let req = galleryObjectStore.openCursor();// phir uss tabale par traverese karne ke liye ek cursor ki request karo
    req.addEventListener("success",function(){
        let cursor = req.result;// request successful hone par waha se cursor lo

        if(cursor)
        {
            let div = document.createElement("div");// mediacard banao

            div.classList.add("media-card"); 
            div.innerHTML = `<div class="media-container"></div>
                            <div class="action-container">
                                <button class="media-download">Download</button>
                                <button class="media-delete" data-id="${cursor.value.mId}">Delete</button>
                            </div>`;
            
            let downloadBtn = div.querySelector(".media-download"); //downloadBtn ka reference lelo
            let deleteBtn = div.querySelector(".media-delete");

            // Agara img/video ho dono me se koi bhi delete karna hai issliye humne yeh funtionality bahar likhi hai
            deleteBtn.addEventListener("click",function(e){
                let mId = e.currentTarget.getAttribute("data-id");
                //UI se card delete krna hai
                e.currentTarget.parentElement.parentElement.remove();//deleteBtn(currTarget) -> action-container(parent) ->media-card(parent).remove()
                //indexdb se card delete krna hai
                deletemediaFromDB(mId);
            })

            if(cursor.value.type == "img")
            {
                let img = document.createElement("img");//img tag create karo
                img.classList.add("media-gallery");// uss par class add karo
                img.src = cursor.value.media;//uska src nikalo cursor.value.media par uska url store kiye hai
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(img);//yeh img tag media-container mei add kardo

                downloadBtn.addEventListener("click",function(e){
                    let a = document.createElement("a");
                    a.download = "image.jpg";
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src;
                    a.click();
                    a.remove();
                });
            }
            else {

                let video = document.createElement("video");
                video.classList.add("media-gallery");
                video.src = window.URL.createObjectURL(cursor.value.media);// hum pura blob store nahi kar sakte issliye hum cursor.value.media par jo blob store hoga uska URl banake yaha store kardenge
                video.addEventListener("mouseenter",function(){
                    video.currentTime = 0;// video phir se start se start karn ke liye
                    video.play();
                });

                video.addEventListener("mouseleave",function(){
                    video.pause();
                });
                video.controls = true;// controls lagado
                video.loop = true;// loop me play hote rahe
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(video);

                downloadBtn.addEventListener("click",function(e){
                    let a = docuemnt.createElement("a");
                    a.download = "video.mp4";
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(".mdeia-container").children[0].src;
                    a.click();
                    a.remove();
                });
            }

            container.appendChild(div);
            cursor.continue();
        }
    });
}

function deletemediaFromDB(mId)
{
    let tx = dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    galleryObjectStore.delete(Number(mId));
}