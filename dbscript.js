function viewMedia(){
    let tx = dbAccess.transaction("gallery","readonly");
    let galleryObjectStore = tx.objectStore("gallery");
    let req = galleryObjectStore.openCursor();
    req.addEventListener("scuccess",function(){
        let cursor = req.result;

        if(cursor)
        {
            let div = document.createElement("div");

            div.classList.add("media-card");
            div.innerHTML = `<div class="media-container"></div>
                            <div class="action-container">
                                <button class="media-download">Download</button>
                                <button class="media-delete" data-id="${cursor.value.mId}">Delete</button>
                            </div>`;
            
            let downloadBtn = div.querySelector(".media-download");
            let deleteBtn = div.querySelector(".media-delete");
            deleteBtn.addEventListener("click",function(e){
                let mId = e.currentTarget.getAttribute("data-id");
                //UI se card delete krna hai
                e.currentTarget.parentElement.parentElement.remove();
                //indexdb se data delete krna hai
                deletemediaFromDB(mId);
            })

            if(cursor.value.type == "img")
            {
                let img = document.createElement("img");
                img.classList.add("media-gallery");
                img.src = cursor.value.media;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(img);

                downloadBtn.addEventListener("click",function(e){
                    let a = docuemnt.createElement("a");
                    a.download = image.jpg;
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(".medai-container").children[0].src;
                    a.click();
                    a.remove();
                });
            }
            else {

                let video = document.createElement("video");
                video.classList.add("media-gallery");
                video.src = window.URL.createObjectURL(cursor.value.media);
                video.addEventListener("mouseenter",function(){
                    video.currentTime = 0;
                    video.play();
                });

                video.addEventListener("mouseleave",function(){
                    video.pause();
                });
                video.controls = true;
                video.loop = true;
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

            CredentialsContainer.appendChild(div);
            cursor.continue();
        }
    });
}