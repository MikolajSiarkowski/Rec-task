// declaring constant variables:
const fileTypes = [                                                           // fileTypes - type of files that drag&drop area should accept
    "image/jpeg",
    "image/jpg"
];
const maxSize = 1048576;                                                      // maxSize - maximum size of the file
const table = document.getElementById('table_body');                 //  table - reference to the body of the table (html element)
const myArray = [];                                                           // myArray - array in which i will store rows to upload to the site

window.addEventListener("dragover",function (evt){       // function that prevents ??????
    evt.preventDefault();
},false);
window.addEventListener("drop",function (evt){           // function that prevents ??????
    evt.preventDefault();
},false);

function validFileType(file) {                                             // function that checks if the type is correct, returns True when type is correct
    return fileTypes.includes(file.type);
}
function validFileSize(file){                                             // function that checks if the size is correct, returns True when size is correct
    return file.size < maxSize;
}
function dmsTodd(dms, dmsRef){                                             // function that reformats coordinates from dms to dd format
    if(dmsRef == "N" || dmsRef == "E"){
        return "+"+Math.round((dms[0] + dms[1]/60 + dms[2]/3600)*100000) /100000;
    } else {
        return "-"+Math.round((dms[0] + dms[1] / 60 + dms[2] / 3600) * 100000) / 100000;
    }
}
function addToArray(metaData, name, imgSrc, size){                         // function that makes an array that contains alle the infromations needed in table
    let temp = [];                                                          // and then add to 'myArray' and calls 'addToTable'
    temp.push(name);
    temp.push('<img src = '+imgSrc+' class="thumbnail"></img>');
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


function addToTable(row, count){                                        // function that fills the 'table' with rows stored in 'myArray'
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

document.querySelector('#inputGroupFile02').addEventListener('change', function(evt){ //function that gets metadata form file input
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
document.querySelector('.drag_drop_area').addEventListener('dragover', function (evt){ //function that change background color when
    evt.stopPropagation();                                                                                          // something is dragged to the drag&drop area
    evt.preventDefault();
    this.classList.add('is-dragover');
})
document.querySelector('.drag_drop_area').addEventListener('dragleave', function (evt){ //function that change background color to default when
    evt.stopPropagation();                                                                                           // something is no alonger draged to the drag&drop area
    evt.preventDefault();
    this.classList.remove('is-dragover');
})
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
