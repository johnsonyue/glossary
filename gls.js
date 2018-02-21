var data_obj;
var MODE_ADD = false;
var MODE_EDIT = false;
var MODE_CONSOLE = false;

var page_size=10, pager_size=10;
var pager_front=1, pager_active=1;

function load(){
$.ajax("db/db.json", {
  type: 'GET',
  async: false,
  success: function(d){
    data_obj = d;
    fill();
  },
  error: function (jqXhr, textStatus, errorMessage) {console.log('Error' + errorMessage);}
});
}

function fill(){
  //fill pager
  pager = $('#pagination');
  pager.find("li").remove();
  pager.find("ul").append("<li id='front' class='page-item'><a class='page-link front' href='#' aria-label='Previous'><span aria-hidden='true'>&laquo;</span><span class='sr-only'>Previous</span></a></li>");
  if (pager_front>1){
    pager.find("ul").append("<li class='page-item'><a class='page-link fb' href='#'>...</a></li>");
  }
  var last = Math.ceil(data_obj.length/page_size);
  for (var i=pager_front; i<Math.min(pager_front+pager_size, last+1); i++){
    if (i == pager_active){
      pager.find("ul").append("<li class='page-item active'><a class='page-link' href='#'>"+(i).toString()+"</a></li>");
    }else{
      pager.find("ul").append("<li class='page-item'><a class='page-link' href='#'>"+(i).toString()+"</a></li>");
    }
  }
  if (last > pager_front+pager_size-1){
    pager.find("ul").append("<li class='page-item'><a class='page-link ff' href='#'>...</a></li>");
  }
  pager.find("ul").append("<li id='end' class='page-item'><a class='page-link end' href='#' aria-label='Next'><span aria-hidden='true'>&raquo;</span><span class='sr-only'>Next</span></a></li>");
  pager.find("li").find("a").click(on_pager_click); 
  
  //fill table
  $('#tbl tbody').html('');
  
  data_obj.slice( (pager_active-1)*page_size, Math.min(pager_active*page_size, data_obj.length) ).forEach(function(i,ind){
    $('#tbl tbody').append('<tr></tr>');
  
    ind += (pager_active-1)*page_size;
    var row = $('#tbl tbody tr:last');
    row.attr('index',ind);
    row.append('<td class="text-center" rowspan='+i[1].length+'>'+ind+'</td>');
    row.append('<td rowspan='+i[1].length+'>'+i[0]+'</td>');
    row.append('<td>'+i[1][0][0]+'</td>');
    row.append('<td>'+i[1][0][1]+'</td>');
    row.append('<td>'+i[1][0][2]+'</td>');
  
    for (var j=1; j<i[1].length; j++){
      $('#tbl tbody').append('<tr></tr>');
  
      var subrow = $('#tbl tbody tr:last');
      subrow.attr('index',ind);
      subrow.append('<td>'+i[1][j][0]+'</td>');
      subrow.append('<td>'+i[1][j][1]+'</td>');
      subrow.append('<td>'+i[1][j][2]+'</td>');
    }
  });

  $('#tbl tbody tr').click(function(){if (!MODE_EDIT){
    var index = $(this).attr('index');
    if ($(this).hasClass('hl')){
      $('#tbl tbody tr[index='+ index +']').removeClass('hl');
      $('#edit_btn').prop('disabled',true);
    }else{
      $('#tbl tbody tr').removeClass('hl');
      $('#tbl tbody tr[index='+ index +']').addClass('hl');
      $('#edit_btn').prop('disabled',false);
    }
  }});
}

function edit_new_def(){
  var hl = $('.hl');
  var r = $('.hl').eq(0).find('td');
  var rowspan = r.eq(0).attr("rowspan");
  r.eq(0).attr("rowspan", parseInt(rowspan) + 1);
  r.eq(1).attr("rowspan", parseInt(rowspan) + 1);

  hl.last().after('<tr class="hl"></tr>');
  hl = $('.hl');
  hl.last().append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
  hl.last().append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
  hl.last().append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
}

function add_new_def(){
  var ar = $('.add-row');
  var r = $('.add-row').eq(0).find('td');
  var rowspan = r.eq(0).attr("rowspan");
  r.eq(0).attr("rowspan", parseInt(rowspan) + 1);
  r.eq(1).attr("rowspan", parseInt(rowspan) + 1);

  ar.last().after('<tr class="add-row"></tr>');
  ar = $('.add-row');
  ar.last().append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
  ar.last().append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
  ar.last().append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
}

function update(ind){
  var d = [];
  var hl = $('.hl');
  
  var r = hl.eq(0).find('td');
  d[0] = r.eq(1).html();
  if (d[0] == "") {
    data_obj.splice(ind,1);
    return;
  }
  d.push([]);

  for (var i=0; i<hl.length; i++){
    var r = hl.eq(i).find('td');
    var t = [];
    (i==0?r.slice(2):r).each(function(){
      t.push($(this).html());
    });
    if (t[0] || t[1] || t[2]) d[1].push(t);
  }

  if (!d[1].length){
    data_obj.splice(ind,1);
  }else{
    data_obj[ind] = d;
  }
}

function add(){
  var d = [];
  var ar = $('.add-row');
  
  var r = ar.eq(0).find('td');
  d[0] = r.eq(1).html();
  if (d[0] == "") return;
  
  d.push([]);

  for (var i=0; i<ar.length; i++){
    var r = ar.eq(i).find('td');
    var t = [];
    (i==0?r.slice(2):r).each(function(){
      t.push($(this).html());
    });
    d[1].push(t);
  }

  if (!d[1].length) return;
  for (var i in data_obj) if(data_obj[i][0]==d[0]){
    return;
  }
  data_obj.push(d);
}

function on_pager_click(e){
  var c=$(this).attr("class");
  var last = Math.ceil(data_obj.length/page_size);
  if (c == 'page-link ff'){
    pager_active=Math.min( pager_front+pager_size, last );
    pager_front=pager_active;
  }else if (c == 'page-link fb'){
    pager_active=Math.max( pager_front-1, 1 );
    pager_front=Math.max( pager_active-pager_size+1, 1 );
  }else if (c == 'page-link front'){
    pager_active=1;
    pager_front=1;
  }else if (c == 'page-link end'){
    pager_active=last;
    pager_front=Math.max( pager_active-pager_size+1, 1 );
  }else{
    pager_active=parseInt($(this).html());
  }
  fill();
}

$('#add_btn').click(function(){
  $('#yes_btn').css('display','block');
  $('#no_btn').css('display','block');
  $('#pagination').css('display','none');
  $('#new_btn').css('display','block');
  $('#edit_btn').css('display','none');
  $('#add_btn').css('display','none');

  $('#tbl tbody').append('<tr class="pad" style="height: 10px;"></tr>');
  $('#tbl tbody').append('<tr class="add-row"></tr>');
  $('#tbl .add-row').append('<td rowspan="1"></td>');
  $('#tbl .add-row').append('<td rowspan="1" contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
  $('#tbl .add-row').append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
  $('#tbl .add-row').append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
  $('#tbl .add-row').append('<td contenteditable="true" style="outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;"></td>');
  
  $('#new_btn').prop('disabled',false);
  MODE_ADD = true;
});

$('#edit_btn').click(function(){
  $('#yes_btn').css('display','block');
  $('#no_btn').css('display','block');
  $('#pagination').css('display','none');
  $('#new_btn').css('display','block');
  $('#edit_btn').css('display','none');
  $('#add_btn').css('display','none');
  
  $('.hl td').attr('contenteditable','true');
  $('.hl td').attr('style','outline: none; border-color: #9ecaed; box-shadow: 0 0 2px #9ecaed;');

  $('#new_btn').prop('disabled',false);
  MODE_EDIT = true;
});

$('#new_btn').click(function(){
  if(MODE_ADD){
    add_new_def();
  }else if(MODE_EDIT){
    edit_new_def();
  }
});

$('#yes_btn').click(function(){
  $('#yes_btn').css('display','none');
  $('#no_btn').css('display','none');
  $('#pagination').css('display','block');
  $('#new_btn').css('display','none');
  $('#add_btn').css('display','block');
  $('#edit_btn').css('display','block');
  if(MODE_ADD){
    var edit_row = $('#tbl tbody tr:last');

    add();
    pager_active = Math.ceil(data_obj.length/page_size);
    pager_front=Math.max( pager_active-pager_size+1, 1 );
    fill();
    $('.add-row').remove();
    $('.pad').remove();
    $('#new_btn').prop('disabled',true);
    MODE_ADD = false;
  }else if(MODE_EDIT){
    $('.hl td').attr('contenteditable','false');
    $('.hl td').attr('style','');
    var ind = $('.hl').attr('index');
    update(ind);
    fill();

    $('#new_btn').prop('disabled',true);
    $('#edit_btn').prop('disabled',true);
    MODE_EDIT = false;
  }
});

$('#no_btn').click(function(){
  $('#yes_btn').css('display','none');
  $('#no_btn').css('display','none');
  $('#pagination').css('display','block');
  $('#new_btn').css('display','none');
  $('#add_btn').css('display','block');
  $('#edit_btn').css('display','block');
  if(MODE_ADD){
    $('.add-row').remove();
    $('.pad').remove();
    $('#new_btn').prop('disabled',true);
    $('#edit_btn').prop('disabled',true);
    MODE_ADD = false;
  }else if(MODE_EDIT){
    $('.hl td').attr('contenteditable','false');
    $('.hl td').attr('style','');
    var ind = $('.hl').attr('index');
    fill();

    $('#new_btn').prop('disabled',true);
    MODE_EDIT = false;
  }
});

$('#save_btn').click(function(){
confirm('overwrite?');
});

//console.
///note it's show and hidden.
$('#help').on('show.bs.modal', function (e) {
  MODE_CONSOLE=true;
});
$('#help').on('hidden.bs.modal', function (e) {
  MODE_CONSOLE=false;
});

document.addEventListener('keyup', function(e){
  if (e.key=='`' && !MODE_ADD && !MODE_EDIT){
    console.log(e.key);
    $('#help').modal(MODE_CONSOLE?'hide':'show');
  }
});

//main
load();
