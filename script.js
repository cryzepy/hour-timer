const VariabelElement = {
    input_hours: document.getElementById('input-hours'),
    input_minutes: document.getElementById('input-minutes'),
    display: document.getElementById('display'),
    header: document.getElementById('header'),
    container_label: document.getElementById('container-label'),
    box_input: document.getElementById('box-input'),
    btn_save: document.getElementById('save'),
    label: document.getElementById('input-label'),
    container_display: document.getElementById('container-display'),
    arrow_toggle: document.getElementById('arrow-toggle'),
    btn_setting: document.getElementById('btn-setting'),
    X_MASTER_KEY: 'private',
    BIN_ID: 'private'

}



//EVENT LISTENER
VariabelElement.input_hours.addEventListener('input', (e) => {
    focusNext(e.target, 2, VariabelElement.input_minutes)
    validasiValue(e.target, 23)
    displayResult(logic(VariabelElement.input_hours.value, VariabelElement.input_minutes.value)[0])
})

VariabelElement.input_minutes.addEventListener('input', (e) => {
    validasiValue(e.target, 59)
    displayResult(logic(VariabelElement.input_hours.value, VariabelElement.input_minutes.value)[0])
})

VariabelElement.input_minutes.addEventListener('keydown', (e) => {
    focusBack(e, VariabelElement.input_hours)
    listenerForSave(e)
})

VariabelElement.btn_save.addEventListener('click', () => {
    if (VariabelElement.input_hours.value.trim().length && VariabelElement.input_minutes.value.trim().length && VariabelElement.label.value.trim().length) {
        save()
        window.location.reload()
    }
})

VariabelElement.arrow_toggle.addEventListener('click',displayToggle)

VariabelElement.btn_setting.addEventListener('click', element_setting);



//FUNCTION
///STORAGE
const Local_storage = {
    getItem: () => JSON.parse(localStorage.getItem('hour timer')) || [],
    setItem: data => localStorage.setItem('hour timer', JSON.stringify(data)),
    delItem: () => localStorage.removeItem('hour timer')
}

const Server_storage = {
    getItem: () => {
        let req = new XMLHttpRequest();
        req.onreadystatechange = () => {

            if (req.readyState == XMLHttpRequest.DONE) {

                if(req.status == 200) {
                    pesan = JSON.parse(req.responseText);
                    Local_storage.setItem(pesan.record)
                    window.location.reload()
                } else {
                    alert(`FAILED : ${req.message}`);
                }
            }
        };

        req.open("GET", `https://api.jsonbin.io/v3/b/${VariabelElement.BIN_ID}`, true);
        req.setRequestHeader("X-Master-Key", VariabelElement.X_MASTER_KEY);
        req.send();
    },
    setItem: () => {
        let req = new XMLHttpRequest();
        req.onreadystatechange = () => {
            if (req.readyState == XMLHttpRequest.DONE) {
                if(req.status == 200) {
                    const pesan = JSON.parse(req.responseText);
                    last_update.setItem(new Date().getTime())
                    alert('SUCCESS UPDATE TO SERVER ID : '+ pesan.metadata.parentId)
                } else {
                    alert('FAILED UPDATE TO SERVER : ' + req.message)
                }
            }
        };

        req.open("PUT", `https://api.jsonbin.io/v3/b/${VariabelElement.BIN_ID}`, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("X-Master-Key", VariabelElement.X_MASTER_KEY);
        req.send(JSON.stringify(Local_storage.getItem()))
    }
}

const last_edit = {
    getItem: () => localStorage.getItem('last-edit-hour-timer'),
    setItem: data => localStorage.setItem('last-edit-hour-timer', data),
    delItem: () => localStorage.removeItem('last-edit-hour-timer')
}

const last_update = {
    getItem: () => localStorage.getItem('last-update-hour-timer'),
    setItem: data => localStorage.setItem('last-update-hour-timer', data),
    delItem: () => localStorage.removeItem('last-update-hour-timer')
}



///LOGIC
function element_builder(tag, parent, attributes, inner) {

    const x = document.createElement(tag)
    parent.appendChild(x)
    
    if (typeof attributes == 'object') {
        for (attribute in attributes) {
            x.setAttribute(attribute, attributes[attribute])
        }
    }
    
    if (typeof attributes == 'string') x.innerText = attributes
    
    if (inner) x.innerText = inner

    return x
}

function validasiValue(target, maxvalue) {
    if (target.value > maxvalue) target.value = maxvalue
}

function logic(hour, minute) {
    const getDateTarget = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), parseInt(hour), parseInt(minute), new Date().getSeconds(), new Date().getMilliseconds()).getTime();
    
    let calc = getDateTarget - Date.now();

    if (calc < 0) calc = calc + 86400000
    
    const toHours = ~~(calc / 1000 / 60 / 60);
    const toMinutes = ~~((calc / 1000 / 60) - toHours * 60);
    
    const result = !hour.length || !minute.length ? 'Masukkan Input Terlebih Dahulu' : toHours == 0 && toMinutes == 0 ? 'now' : `Kurang ${toHours == 0 ? '': toHours + ' Jam'} ${toMinutes == 0 ? '': toMinutes + ' Menit'} Lagi`

    return [result,calc]
}

function timeCondition() {
    const getHours = new Date().getHours();
    return getHours < 11 ? 'Pagi' : getHours < 15 ? 'Siang' : getHours < 19 ? 'Sore' : 'Malam'
}

function focusNext(target, maxlength, next) {
    if (target.value.length > 1) next.focus()
}

function focusBack(e, to) {
    if (e.key == 'Backspace') if (e.target.value.length == 0) to.focus()
}

function id_maker(data) {
    const allid = [...new Set(data.map(x => x.id).sort((b, a) => b - a))]
    
    let result = 0;
    
    for (let i = 0; i < allid.length; i++) {
        if (allid[i] == result) result++
         else {
            if (allid[i] < result) {
                continue
            } else {
                break
            }
        }
    }
    return result
}

function convetTime(time, cond) {
    const gap = Date.now() - time
    
    if(cond == 'edit' && gap < 60000) {
        
    }
    
    if(gap < 60000){
        if(cond == 'edit'){
            return 'Terakhir Edit Beberapa Detik Yang Lalu' 
        }
        else if(cond == 'update'){
            return 'Terakhir Update Beberapa Detik Yang Lalu'
        }
    }

    let bulan = gap
    let hari = gap % 2629746000
    let jam = bulan % 86400000
    let menit = hari % 3600000

    let result = `${bulan/2629746000 >= 1 ? ~~(bulan/2629746000)+' Bulan ': ''}${hari/86400000 >= 1 ? ~~(hari/86400000)+' Hari ': ''}${jam/3600000 >= 1 ? ~~(jam/3600000)+' Jam ': ''}${menit/60000 >= 1 ? ~~(menit/60000)+' Menit ': ''}`

    return `Terakhir ${cond.replace(cond[0],cond[0].toUpperCase())} ${result} Yang Lalu`
}



///ELEMENT
function headerResult(result) {
    VariabelElement.header.innerHTML = 'Selamat ' + result
}

function displayResult(result) {
    VariabelElement.display.innerText = result
}

function runDisplayResult(){
    displayResult(logic(VariabelElement.input_hours.value, VariabelElement.input_minutes.value)[0])
}

function listenerForSave(e) {
    if (e.key == 'Enter' && VariabelElement.input_hours.value.length && VariabelElement.input_minutes.value.length) {
        VariabelElement.container_label.classList.toggle('active')
        VariabelElement.box_input.classList.toggle('active')
        VariabelElement.label.focus()
        VariabelElement.label.addEventListener('keydown', (e) => {
                if (e.key == 'Enter' && VariabelElement.input_hours.value.trim().length != 0 && VariabelElement.input_minutes.value.trim().length != 0 && VariabelElement.label.value.length != 0) {
                    save()
                    window.location.reload()
                }
        })
    }
}

function display() {
    const data = Local_storage.getItem();
    
    if (data.length) {
        VariabelElement.container_display.innerHTML = ''

        data
        .sort((a, b) => logic(a.hour, a.minute)[1] - logic(b.hour, b.minute)[1])
        .forEach(x => {
            const containerItem = element_builder('li', VariabelElement.container_display, {
                class: 'display-item'
            })
            element_builder('span', containerItem, {
                class: 'time-item-display'
            }, x.hour+'.'+x.minute)
            element_builder('span', containerItem, {
                class: 'name-item-display'
            }, x.label)
            element_builder('span', containerItem, {
                class: 'left-item-display'
            }, logic(x.hour, x.minute)[0])
            containerItem.addEventListener('click', () => {
                deleteItem(x.id)
            })
        })

        const item = last_edit.getItem()
        
        
        if (item && Date.now() - (+item) > 0) {
            element_builder('span', VariabelElement.container_display, {
                class: 'last-edit'
            }, convetTime(parseInt(item), 'edit'))
        }

        const delAll = element_builder('span',
            VariabelElement.container_display,
            {
                class: 'delete-all-items',
                id: 'delete-all-items'
            },
            'HAPUS SEMUA')

        delAll.addEventListener('click',
            () => {
                const konfirmasi = confirm('Hapus Semua ?')
                if (konfirmasi) {
                    Local_storage.delItem()
                    last_edit.delItem()
                    last_update.delItem()
                    window.location.reload()
                }
            })
    } else {
        VariabelElement.container_display.style.display = 'none'
        VariabelElement.arrow_toggle.style.display = 'none'
    }
}

function displayToggle() {
    if (Local_storage.getItem().length) {
        VariabelElement.container_display.classList.toggle('active')
        VariabelElement.arrow_toggle.classList.toggle('active')
    }
}

function element_setting() {
    const a = select_popup_bottom([{
        id: 'post-to-serv',
        inner: 'Update Data To Server'
    },
        {
            id: 'get-from-serv',
            inner: 'Update Data From Server'
        }])

    a[0].addEventListener('click',Server_storage.setItem)

    const data = last_update.getItem()
    
    if (data && Date.now() - (+data) > 0) {
        element_builder('span', a[0], convetTime((+data), 'update'))
    }
    a[1].addEventListener('click',Server_storage.getItem)
}

function select_popup_bottom(arr) {
    const container = element_builder('div', document.body, {
        class: 'container-select-sorted'
    })
    container.addEventListener('click', () => {
        container.remove()
        document.querySelector('div.child-container-select-sorted').remove()
    })

    const child = element_builder('div', document.body, {
        class: 'child-container-select-sorted'
    })

    return containerArr = arr.map((x, i) => {
        return (element_builder('li',
            child,
            {
                id: x.id
            },
            x.inner))
    })
}


//DATA
function save() {
    const data = Local_storage.getItem()
    const item = {
        hour: VariabelElement.input_hours.value,
        minute: VariabelElement.input_minutes.value,
        label: VariabelElement.label.value,
        id: id_maker(Local_storage.getItem())
    }
    data.push(item)
    Local_storage.setItem(data)
    last_edit.setItem(Date.now())
}

function deleteItem(id) {
    const data = Local_storage.getItem()
    if (confirm('hapus item')) {
        data.forEach((x, i) => {
            if (x.id == id) {
                data.splice(i, 1)
                Local_storage.setItem(data)
                last_edit.setItem(Date.now)
                window.location.reload()
            }
        })
    }
}

headerResult(timeCondition())


setInterval(runDisplayResult,7500)
display()
setInterval(display,7500)