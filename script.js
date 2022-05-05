// declaring constant variables:
// fileTypes - type of files that drag&drop area should accept
const fileTypes = [
    "image/jpeg",
    "image/jpg"
];
// maxSize - maximum size of the file - 1MB
const maxSize = 1048576;
// table - html element - body of the table
const table = document.getElementById('table_body');
// myArray - array which contains rows to upload to the website
const myArray = [];

window.addEventListener("dragover",function (evt){
    evt.preventDefault();
},false);
window.addEventListener("drop",function (evt){
    evt.preventDefault();
},false);
// function that checks if the type is correct, returns True when type is correct
function validFileType(file) {
    return fileTypes.includes(file.type);
}
// function that checks if the size is correct, returns True when size is correct
function validFileSize(file){
    return file.size <= maxSize;
}
// function that returns coordinates in decimal degrees
function dmsTodd(dms, dmsRef){
    if(dmsRef == "N" || dmsRef == "E"){
        return "+"+Math.round((dms[0] + dms[1]/60 + dms[2]/3600)*100000) /100000;
    } else {
        return "-"+Math.round((dms[0] + dms[1] / 60 + dms[2] / 3600) * 100000) / 100000;
    }
}
// function that make temp array with all the info, adds this array to "myArray"
// and then call "addToTable" function
function addToArray(metaData, name, imgSrc, size){
    let temp = [];
    temp.push(name);
    temp.push('<img src = '+imgSrc+' class="thumbnail"/>');
    temp.push(Math.round((size/1048576) * 100)/100 + " MB");
    let ddLat, ddLong;
    if(metaData.GPSLongitude != undefined){
        ddLong = dmsTodd(metaData.GPSLongitude, metaData.GPSLongitudeRef);
    } else{
        ddLong = "Longitude not given";
    }
    if(metaData.GPSLatitude != undefined){
        ddLat = dmsTodd(metaData.GPSLatitude,metaData.GPSLatitudeRef);
    } else {
        ddLat = "Latitude not given";
    }
    temp.push(ddLat+"</br>"+ddLong);
    myArray.push(temp);
    table.innerHTML = "";
    for(let i = 0; i < myArray.length; i++){
        addToTable(myArray[i], i+1);
    }
    document.getElementById('drag_drop_area').innerHTML = "Done! "+myArray.length+" files uploaded. Drop more files here!";
}

// function that fills the 'table' with rows stored in 'myArray'
function addToTable(row, count){
    let newRow = document.createElement('tr');
    newRow.id = count-1;
    let newCell = document.createElement('td');
    newCell.innerHTML = count.toString();
    newRow.appendChild(newCell);
    for(let i = 0; i<row.length;i++){
         let newCell = document.createElement('td');
         newCell.innerHTML = row[i];
         newRow.appendChild(newCell);
     }
    newCell = document.createElement('td');
    let newButt = document.createElement('button');
    newButt.classList.add("btn");
    newButt.classList.add("btn-danger");
    newButt.innerHTML = 'X';

// function that removes the row from the table, by removing the row from "myArray"
// and then filling the 'table' with other rows stored in 'myArray'
    newButt.onclick = function (){
        let id = this.parentNode.parentNode.id;
        myArray.splice(id,1);
        table.innerHTML = "";
        for(let i = 0; i < myArray.length; i++){
            addToTable(myArray[i], i+1);
        }
        if(myArray.length == 0){
            document.getElementById('drag_drop_area').innerHTML = "Drop more files here!";
        }else{
            document.getElementById('drag_drop_area').innerHTML = "Done! "+myArray.length+" files uploaded. Drop more files here!";
        }

    }
    newCell.appendChild(newButt);
    newRow.appendChild(newCell);
    table.appendChild(newRow);
}
//function that gets metadata form file input and then calls 'addToArray'
document.querySelector('#inputGroupFile02').addEventListener('change', function(evt){
    for(let i = 0; i < this.files.length; i++){
        if(!validFileType(this.files[i])){
            alert("Ony .jpg and .jpeg files are correct!");
            return;
        }
        if(!validFileSize(this.files[i])){
            alert("The file is too big, maximum files size is 1MB");
            return;
        }
    }
    for(let i = 0; i < this.files.length; i++){
        EXIF.getData(this.files[i], function () {
            let tags = EXIF.getAllTags(this);
            let imgSrc = URL.createObjectURL(evt.target.files[i]);
            let picName = this.name;
            let size = this.size;
            addToArray(tags, picName, imgSrc, size);
        });
    }
})
//adding the drag effect on drag&drop area when something is dragged on it
document.querySelector('.drag_drop_area').addEventListener('dragover', function (evt){
    evt.stopPropagation();
    evt.preventDefault();
    this.classList.add('is-dragover');
})
//removing the drag effect from drag&drop area when dragging is over
document.querySelector('.drag_drop_area').addEventListener('dragleave', function (evt){
    evt.stopPropagation();
    evt.preventDefault();
    this.classList.remove('is-dragover');
})
//removing drag effect from drag&drop area when files are dropped, checking size and type, if correct proceed to
// adding to 'myArray'
document.querySelector('.drag_drop_area').addEventListener('drop', function (evt){ //
    evt.stopPropagation();
    evt.preventDefault();
    this.classList.remove('is-dragover');

    for(let i = 0; i < evt.dataTransfer.files.length; i++){
        if(!validFileType(evt.dataTransfer.files[i])){
        alert("Ony .jpg and .jpeg files are correct!");
        this.innerHTML = "Woops! The file must be .jpg or .jpeg. Try again!";
        return;
        }
        if(!validFileSize(evt.dataTransfer.files[i])){
            alert("The file is too big, maximum files size is 1MB");
            this.innerHTML = "Woops! The file is too big, try again!";
            return;
        }
    }
    for(let i = 0; i < evt.dataTransfer.files.length; i++){
        let imgSrc = URL.createObjectURL(evt.dataTransfer.items[i].getAsFile());
        EXIF.getData(evt.dataTransfer.files[i], function () {
            let tags = EXIF.getAllTags(this);
            let picName = this.name;
            let size = this.size;
            addToArray(tags, picName,imgSrc, size);
        });
    }
})
