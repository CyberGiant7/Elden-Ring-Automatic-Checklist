const fileSelector = document.getElementById("savefile");

const pattern = new Uint8Array([0xB0, 0xAD, 0x01, 0x00, 0x01, 0xFF, 0xFF, 0xFF]);
const pattern_dlc = new Uint8Array([0xB0, 0xAD, 0x01, 0x00, 0x01]);
let isDlcFile = false;


let file_read = null;
let inventory = null;
let result = { worked: false, owned: null, "not-owned": null, counter: null };
var all_items = null;
var item_counter = null;
var item_dict_template = null;
var eventflag_bst_map = null;


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

function calculate() {
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

function fetchJson(url, callback) {
  $.ajax({
    url: url,
    async: false,
    dataType: "json",
    success: callback,
  });
}

function getJsonFiles() {
  fetchJson("assets/json/all_items.json", function (data) {
    all_items = { ...data };

    if ($("#altered-armor").is(":checked")) {
      fetchJson("assets/json/altered_armor.json", function (data2) {
        all_items.armor = { ...all_items.armor, ...data2 };
      });
    }

    if ($("#unobtainable-items").is(":checked")) {
      fetchJson("assets/json/unobtainable.json", function (data2) {
        all_items.armor = { ...all_items.armor, ...data2.armor };
        all_items.talisman = { ...all_items.talisman, ...data2.talisman };
      });
    }

    // Load bosses.json
    fetchJson("assets/json/bosses.json", function (data) {
      all_items.bosses = { ...data.bosses };
    });
    fetchJson("assets/json/graces.json", function (data) {
      all_items.graces = { ...data.graces };
    });
    fetchJson("assets/json/cookbooks.json", function (data) {
      all_items.cookbooks = { ...data.cookbooks };
    });
    fetchJson("assets/json/bell_bearings.json", function (data) {
      all_items.bell_bearings = { ...data.bell_bearings };
    });
    fetchJson("assets/json/whetblades.json", function (data) {
      all_items.whetblades = { ...data.whetblades };
    });
    fetchJson("assets/json/tools.json", function (data) {
      all_items.tools = { ...data.tools };
    });
    fetchJson("assets/json/gestures.json", function (data) {
      all_items.gestures = { ...data.gestures };
    });
    fetchJson("assets/json/crystal_tears.json", function (data) {
      all_items.crystal_tears = { ...data.crystal_tears };
    });

    if ($("#dlc-items").is(":checked")) {
      fetchJson("assets/json/dlc_items.json", function (data2) {
        all_items.armament = { ...all_items.armament, ...data2.armament };
        all_items.armor = { ...all_items.armor, ...data2.armor };
        all_items.talisman = { ...all_items.talisman, ...data2.talisman };
        all_items.ashesOfWar = { ...all_items.ashesOfWar, ...data2.ashesOfWar };
        all_items.magic = { ...all_items.magic, ...data2.magic };
        all_items.spiritAshes = { ...all_items.spiritAshes, ...data2.spiritAshes };
        all_items.bosses = { ...all_items.bosses, ...data2.bosses };
        all_items.graces = { ...all_items.graces, ...data2.graces };
        all_items.cookbooks = { ...all_items.cookbooks, ...data2.cookbooks };
        all_items.bell_bearings = { ...all_items.bell_bearings, ...data2.bell_bearings };
        all_items.whetblades = { ...all_items.whetblades, ...data2.whetblades };
        all_items.tools = { ...all_items.tools, ...data2.tools };
        all_items.gestures = { ...all_items.gestures, ...data2.gestures };
        all_items.crystal_tears = { ...all_items.crystal_tears, ...data2.crystal_tears };
      });
    }
  });


  fetchJson("assets/json/item_dict_template.json", function (data) {
    item_dict_template = { ...data };
  });

  fetchJson("assets/json/item_counter.json", function (data) {
    item_counter = { ...data };
  });


  fetchJson("assets/json/eventflag_bst.json", function (data) {
    eventflag_bst_map = { ...data };
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
  index = subfinder(slot, pattern) + pattern.byteLength + 8
  if (!index) {
    index = subfinder(slot, pattern_dlc) + pattern_dlc.byteLength + 3
    isDlcFile = true
  }
  index1 = subfinder(slot.subarray(index, slot.byteLength), new Uint8Array(50).fill(0)) + index + 6;
  return slot.subarray(index, index1);
}

function getEventFlags(slot) {
  let offset = 0;
  const view = new DataView(slot.buffer, slot.byteOffset, slot.byteLength);

  // 1. ver (u32) + map_id (4) + _0x18 (0x18)
  offset += 4 + 4 + 0x18; // 32

  // 2. ga_items: 0x1400 items, variable size each
  for (let i = 0; i < 0x1400; i++) {
    let item_id = view.getUint32(offset + 4, true);
    offset += 8; // gaitem_handle + item_id
    if (item_id !== 0 && (item_id & 0xf0000000) === 0) {
      offset += 13; // unk2(4) + unk3(4) + aow_gaitem_handle(4) + unk5(1)
    } else if (item_id !== 0 && (item_id & 0xf0000000) === 0x10000000) {
      offset += 8; // unk2(4) + unk3(4)
    }
  }

  // 3. PlayerGameData: 432 bytes
  offset += 432;

  // 4. _0xd0: 208 bytes
  offset += 0xd0;

  // 5. EquipData: 22 u32 fields = 88 bytes
  offset += 88;

  // 6. ChrAsm: 29 u32 fields = 116 bytes
  offset += 116;

  // 7. ChrAsm2: 22 u32 fields = 88 bytes
  offset += 88;

  // 8. EquipInventoryData(0xa80, 0x180):
  //    common_count(4) + 0xa80 items * 12 + key_count(4) + 0x180 items * 12 + next_equip(4) + next_acq(4)
  offset += 4 + (0xa80 * 12) + 4 + (0x180 * 12) + 4 + 4; // 37,520

  // 9. EquipMagicData: 0xC spells * 8 + _0x10(16) + active_slot(4) = 116
  offset += 116;

  // 10. EquipItemData: 0xA quick_slots * 8 + active_slot(4) + 0x6 pouch * 8 + _0x8(8) = 140
  offset += 140;

  // 11. equip_gesture_data: 6 * i32 = 24
  offset += 24;

  // 12. EquipProjectileData: count(4) + count * 8
  let projectile_count = view.getInt32(offset, true);
  offset += 4 + projectile_count * 8;

  // 13. EquippedItems: 39 u32 fields = 156
  offset += 156;

  // 14. EquipPhysicsData: 2 u32 = 8
  offset += 8;

  // 15. _0x4: u32 = 4
  offset += 4;

  // 16. _face_data: 0x12f = 303
  offset += 0x12f;

  // 17. EquipInventoryData(0x780, 0x80):
  //    common_count(4) + 0x780 items * 12 + key_count(4) + 0x80 items * 12 + next_equip(4) + next_acq(4)
  offset += 4 + (0x780 * 12) + 4 + (0x80 * 12) + 4 + 4; // 24,592

  // 18. gesture_game_data: 0x40 * i32 = 256
  offset += 256;

  // 19. Regions: count(4) + count * u32
  let regions_count = view.getUint32(offset, true);
  offset += 4 + regions_count * 4;

  // 20. RideGameData: 3 floats(12) + i32(4) + _0x10(16) + u32(4) + u32(4) = 40
  offset += 40;

  // 21. _0x1(1) + _0x40(64) + _0x4_1(4) + _0x4_2(4) + _0x4_3(4) = 77
  offset += 77;

  // 22. _menu_profile_save_load: 0x1008 = 4104
  offset += 0x1008;

  // 23. _trophy_equip_data: 0x34 = 52
  offset += 0x34;

  // 24. GaItemData: distinct_count(4) + unk1(4) + 0x1b58 items * 16 = 112,008
  offset += 4 + 4 + (0x1b58 * 16);

  // 25. _tutorial_data: 0x408 = 1032
  offset += 0x408;

  // 26. _0x1d: 29
  offset += 0x1d;

  // 27. Return event_flags subarray (0x1bf99f bytes)
  return slot.subarray(offset, offset + 0x1bf99f);
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

const inventoryCategories = {
  armament: { nested: true, subcatKey: "class" },
  armor: { nested: true, subcatKey: "category" },
  ashesOfWar: { nested: true, subcatKey: "category" },
  magic: { nested: true, subcatKey: "category" },
  spiritAshes: { nested: false },
  talisman: { nested: false },
  tools: { nested: false },
  gestures: { nested: false },
  crystal_tears: { nested: false }
};

function parseSlotData(file_read, selected_slot) {
  const saves_array = new Uint8Array(file_read);
  const slot = get_slot_ls(saves_array)[selected_slot];
  const inventory = Array.from(getInventory(slot));
  const event_flags = getEventFlags(slot);
  const id_list = split(inventory, isDlcFile ? 8 : 16)
    .map((raw_id) => getIdReversed(raw_id).toUpperCase());
  return { event_flags, id_list };
}

function processFlags(category, event_flags, owned_items, not_owned_items, isGrouped = false) {
  if (!all_items[category]) return;
  Object.keys(all_items[category]).forEach((flag_id) => {
    const event_id = parseInt(flag_id);
    const block_id = Math.floor(event_id / 1000);

    const bst_val = eventflag_bst_map[block_id];
    if (bst_val === undefined) {
      console.warn(`Missing BST entry for block_id: ${block_id} (event_id: ${event_id})`);
      return;
    }

    const block_offset = bst_val * 125 + Math.floor((event_id % 1000) / 8);
    const bit_index = 7 - (event_id % 8);

    const item = all_items[category][flag_id];
    const byte = event_flags[block_offset];

    const owned = (byte & (1 << bit_index)) !== 0;
    const target = owned ? owned_items : not_owned_items;

    if (isGrouped) {
      const sub = item.subcategory || "Other";
      if (!target[category][sub]) target[category][sub] = [];
      target[category][sub].push(item.name);
    } else {
      target[category].push(item.name);
    }

    if (owned) {
      item_counter[category]["summary"]["owned"]++;
    } else {
      item_counter[category]["summary"]["not-owned"]++;
    }
    item_counter[category]["summary"]["total"]++;
  });
}

function processInventoryItems(id_list, owned_items, not_owned_items) {
  id_list.forEach((id) => {
    for (const [category, config] of Object.entries(inventoryCategories)) {
      const categoryData = all_items[category];
      if (categoryData && id in categoryData) {
        const item = categoryData[id];
        if (config.nested) {
          const sub = item[config.subcatKey];
          owned_items[category][sub].push(item.name);
          item_counter[category][sub]["owned"]++;
          item_counter[category][sub]["total"]++;
        } else {
          owned_items[category].push(item.name);
        }
        item_counter[category]["summary"]["owned"]++;
        item_counter[category]["summary"]["total"]++;
        delete categoryData[id];
        break; // Found the category, move to next id
      }
    }
  });

  for (const [category, config] of Object.entries(inventoryCategories)) {
    const categoryData = all_items[category];
    if (!categoryData) continue;
    for (const id in categoryData) {
      const item = categoryData[id];
      if (config.nested) {
        const sub = item[config.subcatKey];
        not_owned_items[category][sub].push(item.name);
        item_counter[category][sub]["not-owned"]++;
        item_counter[category][sub]["total"]++;
      } else {
        not_owned_items[category].push(item.name);
      }
      item_counter[category]["summary"]["not-owned"]++;
      item_counter[category]["summary"]["total"]++;
    }
  }
}

function getOwnedAndNot(file_read, selected_slot) {
  try {
    const { event_flags, id_list } = parseSlotData(file_read, selected_slot);

    const owned_items = JSON.parse(JSON.stringify(item_dict_template));
    const not_owned_items = JSON.parse(JSON.stringify(item_dict_template));

    // Process event-flag based categories
    processFlags("bosses", event_flags, owned_items, not_owned_items);
    processFlags("graces", event_flags, owned_items, not_owned_items, true);
    processFlags("cookbooks", event_flags, owned_items, not_owned_items);
    processFlags("bell_bearings", event_flags, owned_items, not_owned_items);
    processFlags("whetblades", event_flags, owned_items, not_owned_items);

    // Process inventory-based categories
    processInventoryItems(id_list, owned_items, not_owned_items);

    return { worked: true, owned: owned_items, "not-owned": not_owned_items, counter: item_counter };
  } catch (err) {
    console.error(err);
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

function normalizeWikiName(itemName, stripUpgrade = true) {
  let normalized = itemName;
  if (stripUpgrade) {
    normalized = normalized.replace(/ \+\d+$/, ""); // Remove "+10", "+25", etc.
  } else {
    normalized = normalized.replace(/ \+/g, "+"); // Remove space before "+" (e.g. " +3" -> "+3")
  }
  normalized = normalized.replace(/\[(\d+)\]/g, "($1)");
  normalized = normalized.replace(/ /g, "+");
  return normalized;
}

function getCardMetadata(itemName, categoryName) {
  const BASE_URL = "https://eldenring.wiki.fextralife.com";

  let cardClass = "card";
  let url = "";

  // Handle category-specific URL and styling logic
  switch (categoryName) {
    case "gestures":
      url = `${BASE_URL}/Gestures`;
      break;

    case "graces":
      cardClass += " grace-card";
      url = `${BASE_URL}/Sites+of+Grace`;
      break;

    case "bosses": {
      cardClass += " grace-card";
      const baseBossName = normalizeWikiName(itemName.replace(/\s*\(.*\)\s*$/, "").trim());
      url = `${BASE_URL}/${baseBossName}`;
      break;
    }

    default: {
      const normalizedName = normalizeWikiName(itemName, categoryName !== "talisman");
      url = `${BASE_URL}/${normalizedName}`;
      break;
    }
  }

  return { url, cardClass };
}

function createImageHtml(itemName, categoryName) {
  const skipImageCategories = ["graces", "bosses"];
  if (skipImageCategories.includes(categoryName)) {
    return "";
  }

  // Strip invalid file name characters
  const cleanImgName = itemName.replace(/[:?"*|<>\\/]+/g, "");

  return `
    <img alt="${itemName} img" class="lazy item-img card-img"
         src="https://acegif.com/wp-content/uploads/loading-25.gif"
         data-src="./assets/img/${categoryName}/${cleanImgName}.webp"
         title="${itemName}">
    <br>`.trim();
}

function getCard(itemName, categoryName = "") {
  const { url, cardClass } = getCardMetadata(itemName, categoryName);
  const imgHtml = createImageHtml(itemName, categoryName);

  return `
    <div class="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
      <div class="${cardClass}" title="${itemName}">
        ${imgHtml}
        <p class="card-text">${itemName}</p>
        <a href="${url}" class="stretched-link" target="_blank"></a>
      </div>
    </div>`.trim();
}

function getCategorySection(category, owned) {
  const containerId = owned === "owned" ? `owned-${category}` : `not-owned-${category}`;
  const category_container = document.getElementById(containerId);
  const categoryData = result?.[owned]?.[category];

  if (!category_container || !categoryData || category_container.innerHTML !== "") {
    return;
  }

  const sortItems = (items) => {
    return [...items].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  };

  const renderRow = (items) => {
    const row = document.createElement("div");
    row.className = "row-flex";
    sortItems(items).forEach((item) => {
      row.innerHTML += getCard(item, category);
    });
    category_container.appendChild(row);
  };

  if (!Array.isArray(categoryData)) {
    Object.entries(categoryData).forEach(([type, items]) => {
      let counterStr = "";
      if (item_counter?.[category]?.[type]) {
        counterStr = `<span style="float: right">${item_counter[category][type][owned]}/${item_counter[category][type]["total"]}</span>`;
      }
      category_container.insertAdjacentHTML("beforeend", `<h4>${type}${counterStr}</h4>`);
      renderRow(items);
    });
  } else {
    renderRow(categoryData);
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

function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}