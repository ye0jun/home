//////////////////////////////////////////////////////////////////////
// >> 초기 세팅
//////////////////////////////////////////////////////////////////////

var remoteButtonSetting = () => {
  $('#temperatureNumber').text(data.temperature);
  $('input[name=mode][value=' + data.mode + ']').closest('.btn').button('toggle');
  $('input[name=wind][value=' + data.wind + ']').closest('.btn').button('toggle');

  switch (data.rotate) {
    case 'horizontal_x': $('#wing_vertical').button('toggle'); break;
    case 'vertical_x': $('#wing_horizontal').button('toggle'); break;
    case 'both_o':
      $('#wing_vertical').button('toggle');
      $('#wing_horizontal').button('toggle');
      break;
  }

  switch (data.addOn) {
    case 'clean': $('#addOnClean').button('toggle'); break;
  }

  data.power ? $('input[name=power][value=on]').closest('.btn').button('toggle') :
    $('input[name=power][value=off]').closest('.btn').button('toggle');

  isSettingDone = true;
};

//////////////////////////////////////////////////////////////////////
// >> 전원 설정
//////////////////////////////////////////////////////////////////////

$('input[type=radio][name=power]').on('change', function () {
  if(!isSettingDone) return;
  const value = this.value;
  const sendValue = value == 'on' ? true : false;
  firebase.database().ref('/Airconditional/power').set(sendValue);
});

//////////////////////////////////////////////////////////////////////
// >> 온도 설정
//////////////////////////////////////////////////////////////////////

$('#temperatureDown').click(() => {
  const willChangeTemperature = parseInt($('#temperatureNumber').text()) - 1;
  if (willChangeTemperature < 18)
    return;

  $('#temperatureNumber').text(willChangeTemperature);
  change('temperature', willChangeTemperature + '');
});

$('#temperatureUp').click(() => {
  const willChangeTemperature = parseInt($('#temperatureNumber').text()) + 1;
  if (willChangeTemperature > 30)
    return;

  $('#temperatureNumber').text(willChangeTemperature);
  change('temperature', willChangeTemperature + '');
});

//////////////////////////////////////////////////////////////////////
// >> 모드 설정
//////////////////////////////////////////////////////////////////////

$('input[type=radio][name=mode]').on('change', function () {
  if(!isSettingDone) return;
  const value = this.value;
  if (value == 'auto' || value == 'dehumidification') {
    $('input[name=wind][value=auto]').closest('.btn').button('toggle');
    $('#divWind').css('pointer-events', 'none');
  }
  else {
    $('#divWind').css('pointer-events', '');
  }

  console.log(value);
  change('mode', value);
});

//////////////////////////////////////////////////////////////////////
// >> 바람강도 설정
//////////////////////////////////////////////////////////////////////

$('input[type=radio][name=wind]').on('change', function () {
  if(!isSettingDone) return;
  const value = this.value;
  change('wind', value);
});

//////////////////////////////////////////////////////////////////////
// >> 풍향 설정
//////////////////////////////////////////////////////////////////////


$('.wingControl').click((e) => {
  if(!isSettingDone) return;
  let hIsClick = $('#wing_horizontal').hasClass('active');
  let vIsClick = $('#wing_vertical').hasClass('active');
  const isH = $(e.currentTarget).val();

  if (isH == 'h')
    hIsClick = !hIsClick;
  else
    vIsClick = !vIsClick;

  if (hIsClick && !vIsClick)
    change('rotate', 'vertical_x');
  else if (!hIsClick && vIsClick)
    change('rotate', 'horizontal_x');
  else if (!hIsClick && !vIsClick)
    change('rotate', 'both_x');
  else
    change('rotate', 'both_o');
});

//////////////////////////////////////////////////////////////////////
// >> 추가 기능 설정
//////////////////////////////////////////////////////////////////////

$('#addOnClean').click((e) => {
  if(!isSettingDone) return;
  const isClick = !$(e.currentTarget).hasClass('active');
  isClick ? change('addOn', 'clean') : change('addOn', 'default');
});