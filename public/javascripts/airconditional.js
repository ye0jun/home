// 7F B8 8C 71 FB 27 EF
// ## #C ?R ## AT WM ##
/*
    C = CHECKSUM
    ? = NOT RECOGNIZE   (8 or 0)
    R = ROTATE WINGS    (Horizontal[X] = 2, Vertical[X] = A, Both[X] = 0, Both[O] = C)
    A = ADD-ON          (Default = F, CleanAir = 7)
    T = TEMPERATURE     (B, 3, D, 5, 9, 1, E, 6, A, 2, C, 4, 8)
    W = WIND POWER      (Auto = 7, Low = 5, Mid = 6, HIGH = 2)
    M = MODE            (Auto = F, Cool = 7, Dehumidification = B, JustWind = 3)
*/

var e = {
  checksum: 3,
  unknown: 4,
  rotate: 5,
  addOn: 8,
  temperature: 9,
  wind: 10,
  mode: 11
};
var data = {};
var code = '';
var flagReady = 0;
var isSettingDone = false;

var config = {
  apiKey: "/* private */",
  authDomain: "/* private */",
  databaseURL: "/* private */",
  projectId: "/* private */",
  storageBucket: "/* private */",
  messagingSenderId: "/* private */"
};
firebase.initializeApp(config);

firebase.database().ref('/Airconditional').once('value').then(function (snapshot) {
  const _db_data = snapshot.val();
  code = _db_data.code;
  data.power = _db_data.power;
  decodeIR(code);
  // encodeIR('8');
  $('#loading').fadeOut();
  remoteButtonSetting();
});

var bitwise = (binary) => {
  var final = '';
  for (var i = 0; i < binary.length; i++) {
      if (binary[i] == '0')
          final += '1';
      else if (binary[i] == '1')
          final += '0';
  }
  return final;
};


var countOne = (str) => {
  var count1 = 0;
  var count2 = 0;
  for (var i = 0; i < str.length; i++) {
      if (i < 7 || i > 15) {
          if (str[i] == '1') {
              count1++;
              if (i < 7 || i > 19)
                  count2++;
          }
      }
  }
}

var makeBinary = (decimal) => {
  var binary = (+decimal).toString(2);
  var binaryLength = binary.length;
  if (binaryLength <= 4) {
      for (var i = 0; i < 4 - binaryLength; i++) {
          binary = '0' + binary;
      }
  }
  else {
      binary = binary.substring(1, binary.length);
  }

  return binary;
};

var makeChecksum = (_code) => {
  _code = _code.split('');
  var count = 0;

  for (var i in _code) {
      if (i < 2 || i > 4) {
          var binary = makeBinary(parseInt(('0x' + _code[i])));
          for (var j in binary) {
              if (binary[j] == '1')
                  count += 1;
          }
      }
  }

  var modular = (count + 3) % 16;
  var minus = 16 - modular;
  var binary = makeBinary(minus);
  var reverse = reverseString(binary);
  var hex = parseInt(reverse, 2).toString(16).toUpperCase();

  return hex;
};

var reverseString = (str) => {
  return (str === '') ? '' : reverseString(str.substr(1)) + str.charAt(0);
}

String.prototype.replaceAt = function (index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

var decodeIR = (_code) => {
  var binary = '';
  var hex = '';

  _code = _code.substr(2, _code.length);
  _code = _code.split('');
  for (var i in _code) {
      binary += makeBinary('0x' + _code[i]);
  }
  binary = bitwise(binary);

  binary = binary.match(/.{4}/g);
  for (var i in binary) {
      var part = binary[i];
      hex += parseInt(part, 2).toString(16).toUpperCase();
  }
  code = hex;

  //Rotate
  switch (code[e.rotate]) {
      case '2': data.rotate = 'horizontal_x'; break;
      case 'A': data.rotate = 'vertical_x'; break;
      case '0': data.rotate = 'both_x'; break;
      case 'C': data.rotate = 'both_o'; break;
  }

  //Add-On
  switch (code[e.addOn]) {
      case 'F': data.addOn = 'default'; break;
      case '7': data.addOn = 'clean'; break;
  }

  //Temperature
  switch (code[e.temperature]) {
      case 'B': data.temperature = '18'; break;
      case '3': data.temperature = '19'; break;
      case 'D': data.temperature = '20'; break;
      case '5': data.temperature = '21'; break;
      case '9': data.temperature = '22'; break;
      case '1': data.temperature = '23'; break;
      case 'E': data.temperature = '24'; break;
      case '6': data.temperature = '25'; break;
      case 'A': data.temperature = '26'; break;
      case '2': data.temperature = '27'; break;
      case 'C': data.temperature = '28'; break;
      case '4': data.temperature = '29'; break;
      case '8': data.temperature = '30'; break;
  }

  //Wind Power
  switch (code[e.wind]) {
      case '7': data.wind = 'auto'; break;
      case '5': data.wind = 'low'; break;
      case '6': data.wind = 'mid'; break;
      case '2': data.wind = 'high'; break;
  }

  //Wind Power
  switch (code[e.mode]) {
      case 'F': data.mode = 'auto'; break;
      case '7': data.mode = 'cool'; break;
      case 'B': data.mode = 'dehumidification'; break;
      case '3': data.mode = 'justwind'; break;
  }
};

var encodeIR = (unknownCode) => {
  var _code = '7FB###71####F0';

  //Rotate
  switch (data.rotate) {
      case 'horizontal_x': _code = _code.replaceAt(e.rotate, '2'); break;
      case 'vertical_x': _code = _code.replaceAt(e.rotate, 'A'); break;
      case 'both_x': _code = _code.replaceAt(e.rotate, '0'); break;
      case 'both_o': _code = _code.replaceAt(e.rotate, 'C'); break;
  }

  //Add-On
  switch (data.addOn) {
      case 'default': _code = _code.replaceAt(e.addOn, 'F'); break;
      case 'clean': _code = _code.replaceAt(e.addOn, '7'); break;
  }

  //Temperature
  switch (data.temperature) {
      case '18': _code = _code.replaceAt(e.temperature, 'B'); break;
      case '19': _code = _code.replaceAt(e.temperature, '3'); break;
      case '20': _code = _code.replaceAt(e.temperature, 'D'); break;
      case '21': _code = _code.replaceAt(e.temperature, '5'); break;
      case '22': _code = _code.replaceAt(e.temperature, '9'); break;
      case '23': _code = _code.replaceAt(e.temperature, '1'); break;
      case '24': _code = _code.replaceAt(e.temperature, 'E'); break;
      case '25': _code = _code.replaceAt(e.temperature, '6'); break;
      case '26': _code = _code.replaceAt(e.temperature, 'A'); break;
      case '27': _code = _code.replaceAt(e.temperature, '2'); break;
      case '28': _code = _code.replaceAt(e.temperature, 'C'); break;
      case '29': _code = _code.replaceAt(e.temperature, '4'); break;
      case '30': _code = _code.replaceAt(e.temperature, '8'); break;
  }

  //Wind Power
  switch (data.wind) {
      case 'auto': _code = _code.replaceAt(e.wind, '7'); break;
      case 'low': _code = _code.replaceAt(e.wind, '5'); break;
      case 'mid': _code = _code.replaceAt(e.wind, '6'); break;
      case 'high': _code = _code.replaceAt(e.wind, '2'); break;
  }

  //Wind Power
  switch (data.mode) {
      case 'auto': _code = _code.replaceAt(e.mode, 'F'); break;
      case 'cool': _code = _code.replaceAt(e.mode, '7'); break;
      case 'dehumidification': _code = _code.replaceAt(e.mode, 'B'); break;
      case 'justwind': _code = _code.replaceAt(e.mode, '3'); break;
  }


  //Checksum
  _code = _code.replaceAt(e.checksum, makeChecksum(_code));

  //Unknown
  _code = _code.replaceAt(e.unknown, unknownCode);


  var binary = '';
  _code = _code.split('');
  for (var i in _code) {
      binary += makeBinary('0x' + _code[i]);
  }

  binary = bitwise(binary);

  binary = binary.match(/.{4}/g);
  var encodedString = '';
  for (var i in binary) {
      var part = binary[i];
      encodedString += parseInt(part, 2).toString(16).toLowerCase();
  }
  encodedString = '0x' + encodedString;
  return encodedString;
};

var change = (_function, _value) => {
  data[_function] = _value;

  const command_1 = encodeIR('8');
  const command_2 = encodeIR('0');
  sendCommand(command_1,command_2);
}

var sendCommand = (c1,c2) => {
  firebase.database().ref('/Airconditional/code').set(c1);
  firebase.database().ref('/Airconditional/code').set(c2);
}