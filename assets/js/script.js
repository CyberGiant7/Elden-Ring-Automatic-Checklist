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
let result = { worked: false, owned: null, "not-owned": null, counter: null };
var all_items = null;
var item_counter = null;
var item_dict_template = null;

fileSelector.addEventListener("change", (event) => {
  // no file selected to read
  if (document.querySelector("#savefile").value == null) {
    alert("No file selected");
    return;
  }

  let file = document.querySelector("#savefile").files[0];

  let reader = new FileReader();
  reader.onload = function (e) {
    file_read = e.target.result;
    if (!buffer_equal(file_read["slice"](0, 4), new Int8Array([66, 78, 68, 52]))) {
      e.target.result = null;
      document.getElementById("slot_select").style.display = "none";
      alert("Insert a valid file");
      return;
    }
    updateSlotDropdown(getNames(file_read));
    $("#slot_selector").on("change", function (e) {
      $("#setting_buttons").css("display", "block")
      $("#calculate").css("display", "block")
    });
  };
  reader.onerror = function (e) {
    // error occurred
    console.log("Error : " + e.type);
  };
  reader.readAsArrayBuffer(file);
});

function calculate(){
  let options = $("#slot_selector option:selected");
      let selected_slot = options[0].value;
      getJsonFiles();
      result = getOwnedAndNot(file_read, selected_slot);
      if (result["worked"]) {
        $("#owned").load("page_parts.html #owned_section", () => {
          $("#not-owned").load("page_parts.html #not-owned-section", () => {
            document.getElementById("collapse_button1").style.display = "block";
            document.getElementById("collapse_button2").style.display = "block";
            addFraction();
          });
        });
      }
}

function getJsonFiles() {
  $.ajax({
    url: "assets/json/all_items.json",
    async: false,
    dataType: "json",
    success: function (data) {
      all_items = { ...data };
      if ($("#altered-armor").is(":checked")) {
        $.ajax({
          url: "assets/json/altered_armor.json",
          async: false,
          dataType: "json",
          success: function (data2) {
            all_items.armor = { ...all_items.armor, ...data2 };
          },
        });
      }
      if ($("#unobtainable-items").is(":checked")) {
        $.ajax({
          url: "assets/json/unobtainable.json",
          async: false,
          dataType: "json",
          success: function (data2) {
            all_items.armor = { ...all_items.armor, ...data2 };
          },
        });
      }
    },
  });
  $.ajax({
    url: "assets/json/item_dict_template.json",
    async: false,
    dataType: "json",
    success: function (data) {
      item_dict_template = { ...data };
    },
  });
  $.ajax({
    url: "assets/json/item_counter.json",
    async: false,
    dataType: "json",
    success: function (data) {
      item_counter = { ...data };
    },
  });
}

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

    let owned_items = JSON.parse(JSON.stringify(item_dict_template));
    let not_owned_items = JSON.parse(JSON.stringify(item_dict_template));

    id_list.forEach((id) => {
      if (id in all_items["armament"]) {
        owned_items["armament"][all_items["armament"][id]["class"]].push(all_items["armament"][id]["name"]);
        item_counter["armament"][all_items["armament"][id]["class"]]["owned"]++;
        item_counter["armament"][all_items["armament"][id]["class"]]["total"]++;
        item_counter["armament"]["summary"]["owned"]++;
        item_counter["armament"]["summary"]["total"]++;
        delete all_items["armament"][id];
      } else if (id in all_items["armor"]) {
        owned_items["armor"][all_items["armor"][id]["category"]].push(all_items["armor"][id]["name"]);
        item_counter["armor"][all_items["armor"][id]["category"]]["owned"]++;
        item_counter["armor"][all_items["armor"][id]["category"]]["total"]++;
        item_counter["armor"]["summary"]["owned"]++;
        item_counter["armor"]["summary"]["total"]++;
        delete all_items["armor"][id];
      } else if (id in all_items["ashesOfWar"]) {
        owned_items["ashesOfWar"][all_items["ashesOfWar"][id]["category"]].push(all_items["ashesOfWar"][id]["name"]);
        item_counter["ashesOfWar"][all_items["ashesOfWar"][id]["category"]]["owned"]++;
        item_counter["ashesOfWar"][all_items["ashesOfWar"][id]["category"]]["total"]++;
        item_counter["ashesOfWar"]["summary"]["owned"]++;
        item_counter["ashesOfWar"]["summary"]["total"]++;
        delete all_items["ashesOfWar"][id];
      } else if (id in all_items["magic"]) {
        owned_items["magic"][all_items["magic"][id]["category"]].push(all_items["magic"][id]["name"]);
        item_counter["magic"][all_items["magic"][id]["category"]]["owned"]++;
        item_counter["magic"][all_items["magic"][id]["category"]]["total"]++;
        item_counter["magic"]["summary"]["owned"]++;
        item_counter["magic"]["summary"]["total"]++;
        delete all_items["magic"][id];
      } else if (id in all_items["spiritAshes"]) {
        owned_items["spiritAshes"].push(all_items["spiritAshes"][id]["name"]);
        item_counter["spiritAshes"]["summary"]["owned"]++;
        item_counter["spiritAshes"]["summary"]["total"]++;
        delete all_items["spiritAshes"][id];
      } else if (id in all_items["talisman"]) {
        owned_items["talisman"].push(all_items["talisman"][id]["name"]);
        item_counter["talisman"]["summary"]["owned"]++;
        item_counter["talisman"]["summary"]["total"]++;
        delete all_items["talisman"][id];
      }
    });

    for (let item_type in all_items) {
      for (let id in all_items[item_type]) {
        if (item_type === "armament") {
          not_owned_items["armament"][all_items["armament"][id]["class"]].push(all_items["armament"][id]["name"]);
          item_counter[item_type][all_items[item_type][id]["class"]]["not-owned"]++;
          item_counter[item_type][all_items[item_type][id]["class"]]["total"]++;
          item_counter[item_type]["summary"]["not-owned"]++;
          item_counter[item_type]["summary"]["total"]++;
        } else if (item_type === "armor" || item_type === "ashesOfWar" || item_type === "magic") {
          not_owned_items[item_type][all_items[item_type][id]["category"]].push(all_items[item_type][id]["name"]);
          item_counter[item_type][all_items[item_type][id]["category"]]["not-owned"]++;
          item_counter[item_type][all_items[item_type][id]["category"]]["total"]++;
          item_counter[item_type]["summary"]["not-owned"]++;
          item_counter[item_type]["summary"]["total"]++;
        } else if (item_type === "spiritAshes" || item_type === "talisman") {
          not_owned_items[item_type].push(all_items[item_type][id]["name"]);
          item_counter[item_type]["summary"]["not-owned"]++;
          item_counter[item_type]["summary"]["total"]++;
        }
      }
    }
    return { worked: true, owned: owned_items, "not-owned": not_owned_items, counter: item_counter };
  } catch (err) {
    console.log(err);
    console.log("insert a valid file");
    return { worked: false, owned: null, "not-owned": null, counter: null };
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
<img alt="${item_name} img" class="lazy item-img card-img"
           src="https://acegif.com/wp-content/uploads/loading-25.gif"
					 data-src="./assets/img/${category_name}/${item_name.replace(/[\:]+/g, "")}.png"
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
  } else if (owned === "not-owned") {
    category_container = document.getElementById(`not-owned-${category}`);
  }
  if (category_container.innerHTML === "") {
    let i = 0;
    if (!Array.isArray(result[owned][category])) {
      for (let type in result[owned][category]) {
        category_container.innerHTML += `<h4>${type}<span style="float: right">${item_counter[category][type][owned]}/${item_counter[category][type]["total"]}</span></h4>`;
        category_container.innerHTML += `<div class="row-flex">`;
        let category_row = category_container.getElementsByClassName(`row-flex`)[i];
        for (let i in result[owned][category][type]) {
          category_row.innerHTML += getCard(result[owned][category][type][i], category);
        }
        i++;
      }
    } else {
      category_container.innerHTML += `<div class="row-flex">`;
      let category_row = category_container.getElementsByClassName(`row-flex`)[0];
      for (let i in result[owned][category]) {
        category_row.innerHTML += getCard(result[owned][category][i], category);
      }
    }
  }
  $(function () {
    $("img.lazy").Lazy({
      // your configuration goes here
      scrollDirection: "vertical",
      effect: "fadeIn",
      visibleOnly: true,
      onError: function (element) {
        console.log("error loading " + element.data("src"));
      },
    });
  });
}

function addFraction() {
  item_counter = result["counter"];
  ["owned", "not-owned"].forEach((owned) => {
    for (let item_type in item_counter) {
      $(`#${owned}-${item_type}`)
        .prev()
        .find("h3")
        .append(`<span style="float: right">${item_counter[item_type]["summary"][owned]}/${item_counter[item_type]["summary"]["total"]}</span>`);
    }
  });
}
