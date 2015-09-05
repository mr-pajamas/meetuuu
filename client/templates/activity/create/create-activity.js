/* created by ck 2015-09-02 */

Template.createActivity.onCreated(function(){
  console.log('onCreated');
});

Template.createActivity.onRendered(function(){
  console.log('onRendered');
  var selectpickerOption = {
    style: 'btn-default',
    width: '120px'
  };
  this.$('.selectpickerProvince').selectpicker(selectpickerOption);
  this.$('.selectpickerCity').selectpicker(selectpickerOption);
  this.$('.activityTheme').selectpicker(_.extend(selectpickerOption, {width: '320px'}));

  this.$('input[name="daterange"]').daterangepicker({
    "timePicker": true,
    "autoApply": true,
    "timePickerIncrement": 10,
    "showDropdowns": true,
    "locale": {
      "format": "MM/DD/YYYY A h:mm",
      "separator": " 至 ",
      "applyLabel": "确认",
      "cancelLabel": "取消",
      "fromLabel": "开始时间",
      "toLabel": "结束时间",
      "customRangeLabel": "Custom",
      "daysOfWeek": [
        "日",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六"
      ],
      "monthNames": [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月"
      ],
      "firstDay": 1,
    }
  }, function(start, end, label) {
    console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
  });

  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  };

  var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
    'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];
  this.$('#activityTags').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'states',
    source: substringMatcher(states)
  });
});

Meteor.setTimeout(function() {
  $('#activityTags').bind('typeahead:select', function(ev, suggestion) {
    console.log('Selection: ' + suggestion);
  });
}, 2000);



// helpers
Template.createActivity.helpers({

});


// events
Template.createActivity.events({

});