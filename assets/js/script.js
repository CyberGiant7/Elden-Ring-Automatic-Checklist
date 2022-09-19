const fileSelector = document.getElementById("savefile");
let pattern = new Uint8Array([
  255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]);

let file_read = null;
let inventory = null;
let result = { worked: false, owned: null, not_owned: null };

fileSelector.addEventListener("change", (event) => {
  // no file selected to read
  if (document.querySelector("#savefile").value == null) {
    alert("No file selected");
    return;
  }

  let file = document.querySelector("#savefile").files[0];

  let reader = new FileReader();
  reader.onload = function (e) {
    // binary data
    file_read = e.target.result;
    // if (!buffer_equal(file_read["slice"](0, 4), new Int8Array([66, 78, 68, 52]))) {
    //   e.target.result = null;
    //   document.getElementById("slot_select").style.display = "none";
    //   alert("Insert a valid file");
    //   return;
    // }
    updateSlotDropdown(getNames(file_read));
    $("#slot_selector").on("change", function (e) {
      let options = $("#slot_selector option:selected");
      let selected_slot = options[0].value;
      result = getOwnedAndNot(file_read, selected_slot);
      console.log(result["owned"]);
      if (result["worked"]) {
        document.getElementById("owned").innerHTML = `
        <div class="container" style="display:flex; flex-direction: column;">
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#owned-armament"
          onclick="getCategorySection('armament', 'owned')"
        >
        <h3>Weapons</h3>
        </button>
        <div class="container-fluid collapse" id="owned-armament"></div>
  
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#owned-armor"
          onclick="getCategorySection('armor', 'owned')"
        >
        <h3>Armors</h3>
        </button>
        <div class="container-fluid collapse" id="owned-armor"></div>
  
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#owned-talisman"
          onclick="getCategorySection('talisman', 'owned')"
        >
        <h3>Talisman</h3>
        </button>
        <div class="container-fluid collapse" id="owned-talisman"></div>
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#owned-magic"
          onclick="getCategorySection('magic', 'owned')"
        >
        <h3>Magic</h3>
        </button>
        <div class="container-fluid collapse" id="owned-magic"></div>
  
        <button
        class="btn btn-dark row button-collapse"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#owned-ashesOfWar"
        onclick="getCategorySection('ashesOfWar', 'owned')"
      >
        <h3>Ashes of War</h3>
        </button>
        <div class="container-fluid collapse" id="owned-ashesOfWar"></div>
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#owned-spiritAshes"
          onclick="getCategorySection('spiritAshes', 'owned')"
        >
        <h3>Spirit Ashes</h3>
        </button>
        <div class="container-fluid collapse" id="owned-spiritAshes"></div>
        </div>
      `;
        document.getElementById("not_owned").innerHTML = `
        <div class="container" style="display:flex; flex-direction: column;">
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#not-owned-armament"
          onclick="getCategorySection('armament', 'not_owned')"
        >
        <h3>Weapons</h3>
        </button>
        <div class="container-fluid collapse" id="not-owned-armament"></div>
  
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#not-owned-armor"
          onclick="getCategorySection('armor', 'not_owned')"
        >
        <h3>Armors</h3>
        </button>
        <div class="container-fluid collapse" id="not-owned-armor"></div>
  
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#not-owned-talisman"
          onclick="getCategorySection('talisman', 'not_owned')"
        >
        <h3>Talisman</h3>
        </button>
        <div class="container-fluid collapse" id="not-owned-talisman"></div>
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#not-owned-magic"
          onclick="getCategorySection('magic', 'not_owned')"
        >
        <h3>Magic</h3>
        </button>
        <div class="container-fluid collapse" id="not-owned-magic"></div>
  
        <button
        class="btn btn-dark row button-collapse"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#not-owned-ashesOfWar"
        onclick="getCategorySection('ashesOfWar', 'not_owned')"
      >
        <h3>Ashes of War</h3>
        </button>
        <div class="container-fluid collapse" id="not-owned-ashesOfWar"></div>
        <button
          class="btn btn-dark row button-collapse"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#not-owned-spiritAshes"
          onclick="getCategorySection('spiritAshes', 'not_owned')"
        >
        <h3>Spirit Ashes</h3>
        </button>
        <div class="container-fluid collapse" id="not-owned-spiritAshes"></div>
        </div>
      `;
        document.getElementById("collapse_button1").style.display = "block";
        document.getElementById("collapse_button2").style.display = "block";
      }
    });
  };
  reader.onerror = function (e) {
    // error occurred
    console.log("Error : " + e.type);
  };
  reader.readAsArrayBuffer(file);
});

function get_slot_ls(dat) {
  let slot1 = dat.subarray(0x00000310, 0x0028030f + 1);
  let slot2 = dat.subarray(0x00280320, 0x050031f + 1);
  let slot3 = dat.subarray(0x500330, 0x78032f + 1);
  let slot4 = dat.subarray(0x780340, 0xa0033f + 1);
  let slot5 = dat.subarray(0xa00350, 0xc8034f + 1);
  let slot6 = dat.subarray(0xc80360, 0xf0035f + 1);
  let slot7 = dat.subarray(0xf00370, 0x118036f + 1);
  let slot8 = dat.subarray(0x1180380, 0x140037f + 1);
  let slot9 = dat.subarray(0x1400390, 0x168038f + 1);
  let slot10 = dat.subarray(0x16803a0, 0x190039f + 1);
  return [slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9, slot10];
}

function subfinder(mylist, pattern) {
  for (let i = 0; i < mylist.byteLength; i++) {
    if (mylist[i] === pattern[0] && buffer_equal(mylist.subarray(i, i + pattern.byteLength), pattern)) return i;
  }
}

function buffer_equal(buf1, buf2) {
  if (buf1.byteLength !== buf2.byteLength) return false;
  let dv1 = new Int8Array(buf1);
  let dv2 = new Int8Array(buf2);
  for (let i = 0; i !== buf1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) return false;
  }
  return true;
}

function getInventory(slot) {
  index = subfinder(slot, pattern) + pattern.byteLength + 56;
  index1 = subfinder(slot.subarray(index, slot.byteLength), new Uint8Array(50).fill(0)) + index + 6;
  return slot.subarray(index, index1);
}

function split(list_a, chunk_size) {
  let splitted = [];
  for (let i = 0; i < list_a.length; i += chunk_size) {
    let chunk = list_a.slice(i, i + chunk_size);
    splitted.push(chunk);
  }
  return splitted;
}

function getIdReversed(id) {
  let final_id = "";
  tmp = id.slice(0, 4).reverse();
  for (let i = 0; i < 4; i++) {
    final_id += decimalToHex(tmp[i], 2);
  }
  return final_id;
}

function decimalToHex(d, padding) {
  let hex = Number(d).toString(16);
  padding = typeof padding === "undefined" || padding === null ? (padding = 2) : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }
  return hex;
}

function getOwnedAndNot(file_read, selected_slot) {
  try {
    let saves_array = new Uint8Array(file_read);
    let slots = get_slot_ls(saves_array);
    let inventory = Array.from(getInventory(slots[selected_slot]));
    let id_list = split(inventory, 16);
    id_list.forEach((raw_id, index) => (id_list[index] = getIdReversed(raw_id).toUpperCase()));

    let owned_items = JSON.parse(localStorage.getItem("item_dict_template"));
    let not_owned_items = JSON.parse(localStorage.getItem("item_dict_template"));
    let all_items = JSON.parse(localStorage.getItem("all_items"));

    id_list.forEach((id) => {
      if (id in all_items["armament"]) {
        owned_items["armament"][all_items["armament"][id].class].push(all_items["armament"][id]["name"]);
        delete all_items["armament"][id];
      } else if (id in all_items["armor"]) {
        owned_items["armor"][all_items["armor"][id]["category"]].push(all_items["armor"][id]["name"]);
        delete all_items["armor"][id];
      } else if (id in all_items["ashesOfWar"]) {
        owned_items["ashesOfWar"][all_items["ashesOfWar"][id]["category"]].push(all_items["ashesOfWar"][id]["name"]);
        delete all_items["ashesOfWar"][id];
      } else if (id in all_items["magic"]) {
        owned_items["magic"][all_items["magic"][id]["category"]].push(all_items["magic"][id]["name"]);
        delete all_items["magic"][id];
      } else if (id in all_items["spiritAshes"]) {
        owned_items["spiritAshes"].push(all_items["spiritAshes"][id]["name"]);
        delete all_items["spiritAshes"][id];
      } else if (id in all_items["talisman"]) {
        owned_items["talisman"].push(all_items["talisman"][id]["name"]);
        delete all_items["talisman"][id];
      }
    });

    for (let item_type in all_items) {
      for (let id in all_items[item_type]) {
        if (item_type === "armament") not_owned_items["armament"][all_items["armament"][id]["class"]].push(all_items["armament"][id]["name"]);
        else if (item_type === "armor" || item_type === "ashesOfWar" || item_type === "magic")
          not_owned_items[item_type][all_items[item_type][id]["category"]].push(all_items[item_type][id]["name"]);
        else if (item_type === "spiritAshes" || item_type === "talisman") not_owned_items[item_type].push(all_items[item_type][id]["name"]);
      }
    }
    return { worked: true, owned: owned_items, not_owned: not_owned_items };
  } catch (err) {
    console.log("insert a valid file");
    return { worked: false, owned: null, not_owned: null };
  }
}

function getNames(file_read) {
  let decoder = new TextDecoder("utf-8");
  let name1 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1901d0e, 0x1901d0e + 32)))));
  let name2 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1901f5a, 0x1901f5a + 32)))));
  let name3 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x19021a6, 0x19021a6 + 32)))));
  let name4 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x19023f2, 0x19023f2 + 32)))));
  let name5 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x190263e, 0x190263e + 32)))));
  let name6 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x190288a, 0x190288a + 32)))));
  let name7 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1902ad6, 0x1902ad6 + 32)))));
  let name8 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1902d22, 0x1902d22 + 32)))));
  let name9 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1902f6e, 0x1902f6e + 32)))));
  let name10 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x19031ba, 0x19031ba + 32)))));

  let names = [name1, name2, name3, name4, name5, name6, name7, name8, name9, name10];
  names.forEach((name, index) => {
    names[index] = name.replaceAll("\x00", "");
  });
  return names;
}

function updateSlotDropdown(slot_name_list) {
  let select = document.getElementById("slot_select");
  select.innerHTML = `<i class="icofont-rounded-right"></i> <strong>Select slot: </strong>
        <select class="form-select" aria-label="Select slot" id="slot_selector">
         <option hidden selected>Select the slot whose inventory you want to analyze</option>`;
  let selector = select.getElementsByTagName("select")[0];
  for (let i = 0; i < 10; i++) {
    if (slot_name_list[i] === "") {
      selector.innerHTML += `<option value="${i}" disabled> - </option>`;
    } else {
      selector.innerHTML += `<option value="${i}"> ${slot_name_list[i]} </option>`;
    }
  }
  select.style.display = "block";
}

function getCard(item_name, category_name) {
  return `<div class=".col-6 .col-sm-4 .col-md-3 .col-lg-2 col-xl-2">
<div class="card" title="${item_name}" > 
<img alt="${item_name} img" class="item-img card-img"
					 src="./assets/img/${category_name}/${item_name.replace(/[\:]+/g, "")}.png"
					 title="${item_name}">
<br>
<p class="card-text">${item_name}</p>
<a href="https://eldenring.wiki.fextralife.com/${item_name.replaceAll(" ", "+")}" class="stretched-link" target="_blank"> </a> </div>
</div>`;
}

function getCategorySection(category, owned) {
  let category_container;
  if (owned === "owned") {
    category_container = document.getElementById(`owned-${category}`);
  } else if (owned === "not_owned") {
    category_container = document.getElementById(`not-owned-${category}`);
  }
  if (category_container.innerHTML === "") {
    let i = 0;
    if (!Array.isArray(result[owned][category])) {
      for (let type in result[owned][category]) {
        category_container.innerHTML += `<h4>${type}</h4>`;
        category_container.innerHTML += `<div class="row-flex">`;
        let category_row = category_container.getElementsByClassName(`row-flex`)[i];
        for (let i in result[owned][category][type]) {
          category_row.innerHTML += getCard(result[owned][category][type][i], category);
        }
        i++;
      }
    } else{
      category_container.innerHTML += `<div class="row-flex">`;
      let category_row = category_container.getElementsByClassName(`row-flex`)[0];
      for (let i in result[owned][category]){
        category_row.innerHTML += getCard(result[owned][category][i],  category)
      }
    }
  }
}
