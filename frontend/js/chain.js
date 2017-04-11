var transactions ;
var previous_clicked_block = null;

var total_transactions=0;
var received_bills=0;
var partially_approved_bills=0;
var approved_bills=0;
var rejected_bills=0;
var paid_bills=0;
var ml=0;


$(document).ready(function(){

    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify({
        jsonrpc: "2.0",
        method: "query",
        params: {
          type: 1,
          chaincodeID: {
            name: "e7013fe7664a3b52743c0daf075972d011c883a8d4de75a5b5d93e7b064b7e4cd438960e89d7440ef4658e198f316e64e326dbbba333225837d7de8f7fdeeba9"
          },
          ctorMsg: {
            function: "get_count",
            args: [
            ]
          },
          secureContext: "admin"
        },
        id: 0
      }),
      contentType: 'application/json',
      crossDomain: true,
      url: 'https://013148a355384b06820606ca19eb5374-vp0.us.blockchain.ibm.com:5003/chaincode',
      success: function(d) {
        transactions = parseInt(d.result.message);
        //alert(transactions);
        total_transactions = transactions;
        for(i=1; i<=transactions; i++){
          var id = i.toString();
          var newblock = '<div class="individual_block" id="'+id+'" onclick="block_click(this)"><div class="block_header"></div><div class="block_content"></div></div>';
          $('.block_scroll').append(newblock);
        }

        $('.block_content').hide();

        $('#ledger .left_arrow').click(function(){
          if(ml < 0){
            $('#ledger .block_scroll').animate( {  marginLeft: '+=440' }, 1000);
            ml+=440;
          }
        });

        $('#ledger .right_arrow').click(function(){
          //if((transactions-3)*-110 < ml){
            $('#ledger .block_scroll').animate( {  marginLeft: '-=440' }, 1000);
            ml-=440;
          //}
        });

        $('#search_results .left_arrow').click(function(){
          $('#search_results .block_scroll').animate( {  marginLeft: '+=440' }, 1000);
        });

        $('#search_results .right_arrow').click(function(){
          $('#search_results .block_scroll').animate( {  marginLeft: '-=440' }, 1000);
        });

        //fill data
        for(i=transactions;i>0;i--){
          var j = i.toString();
          $.ajax({
            type: 'POST',
            dataType: 'json',
            indexValue: i,
            data: JSON.stringify({
              jsonrpc: "2.0",
              method: "query",
              params: {
                type: 1,
                chaincodeID: {
                  name: "e7013fe7664a3b52743c0daf075972d011c883a8d4de75a5b5d93e7b064b7e4cd438960e89d7440ef4658e198f316e64e326dbbba333225837d7de8f7fdeeba9"
                },
                ctorMsg: {
                  function: "get_transaction",
                  args: [ j
                  ]
                },
                secureContext: "admin"
              },
              id: 0
            }),
            contentType: 'application/json',
            crossDomain: true,
            url: 'https://013148a355384b06820606ca19eb5374-vp0.us.blockchain.ibm.com:5003/chaincode',
            success: function(d) {
              //alert(JSON.stringify(d));
              //alert( d.result.message);

              var result = JSON.parse( d.result.message);
              var billjson = JSON.parse(result.bill_details);
              var status = result.operation;
              if(result.operation =='Submit'){
                status = "Create";
              }
              if (result.operation == "Pay"){
                status = "Process Payment";
              }

              var newentry ='<b>Entity Name:</b>'+result.entity_involved.entity_name+'<br>'+
                            '<b>Entity Role:</b>'+result.entity_involved.entity_role+'<br>'+
                            '<b>Claim Id:</b>'+result.claim_id+'<br>'+
                            '<b>Bill Id:</b>'+result.bill_id+'<br>'+
                            '<b>Operation:</b>'+status+'<br>'+
                            '<b>Status:</b>'+result.bill_status+'<br>'+
                            '<b>Amount Claimed:</b>'+billjson.amount_claimed+'<br>'+
                            '<b>Amount Approved:</b>'+billjson.amount_approved+'<br>'+
                            '<b>Comments:</b>'+billjson.reason+'<br>'+
                            '<b>Date:</b>'+result.date+'<br>';

              var element_id = "#"+this.indexValue;
              //alert(element_id);
              $(element_id+' .block_header').html('<div><span class="bill_id">'+result.bill_id+'</span><br>'+result.bill_status+'</div>');
              $(element_id+' .block_content').html(newentry);
              if(result.bill_status == 'Received'){
                received_bills = received_bills+1;
                $(element_id).addClass('received');
              }
              if(result.bill_status == 'Approved'){
                approved_bills = approved_bills+1;
                $(element_id).addClass('approved');
              }
              if(result.bill_status == 'Partially approved'){
                partially_approved_bills = partially_approved_bills+1;
                $(element_id).addClass('partially_approved');
              }
              if(result.bill_status == 'Rejected'){
                rejected_bills = rejected_bills+1;
                $(element_id).addClass('rejected');
              }
              if(result.bill_status == 'Paid'){
                paid_bills = paid_bills+1;
                $(element_id).addClass('paid');
              }
              document.getElementById('total_transactions').innerHTML = total_transactions;
              document.getElementById('received_bills').innerHTML = received_bills;
              document.getElementById('approved_bills').innerHTML = approved_bills;
              document.getElementById('partially_approved_bills').innerHTML = partially_approved_bills;
              document.getElementById('paid_bills').innerHTML = paid_bills;
              document.getElementById('rejected_bills').innerHTML = rejected_bills;
            },
            error: function(e)
            {
                  alert("Error while loading the result");
                  //alert(JSON.stringify(e));
            }
          });



        }


        length = (Math.floor(transactions/4)-1)*440;
        if(transactions*110>1200){
          scroll_length = '-='+length.toString();
          $('#ledger .block_scroll').animate( {  marginLeft: scroll_length }, 1000);
          ml-=length;
        }
      },
      error: function(e)
      {
            alert("Error while loading the result");
            //alert(JSON.stringify(e));
      }
    });


    setInterval("update()",5000);

    $('#search').click(function(){
      //alert("searching");
      $('#search_results .block_scroll').empty();
      var search_bill_id = $('#search_bill_id').val();
      //alert(search_bill_id);
      var bills = $('.block_scroll').children();
      var bill_id;
      for(i=0; i<bills.length; i++){
       bill_id = $(bills[i]).find('.bill_id').text();
       if(bill_id == search_bill_id){
        // alert(bill_id);
        $(bills[i]).clone().appendTo('#search_results .block_scroll');
       }
      }
    });

});

function block_click(b) {
    //var b = "#"+thisid;
  //alert(b);
    if($(b).attr('data-click-state') == 1) {
      $(b).attr('data-click-state', 0)
      $($(b).find('.block_content')).slideUp(function() {
          $(b).switchClass('block_transition_right','individual_block',1000,function(){
          });
      });
      previous_clicked_block = null;
    } else {
      if(previous_clicked_block!=b && previous_clicked_block!=null){
        $(previous_clicked_block).attr('data-click-state', 0)
        $($(previous_clicked_block).find('.block_content')).slideUp(function() {
          $(previous_clicked_block).switchClass('block_transition_right','individual_block',1000,function(){});
            $(b).attr('data-click-state', 1)
            $(b).switchClass('individual_block','block_transition_right',1000, function(){
              $($(b).find('.block_content')).slideDown(function() {
                previous_clicked_block = b;
              });
            });
        });
      }else{
        $(b).attr('data-click-state', 1)
        $(b).switchClass('individual_block','block_transition_right',1000, function(){
            $($(b).find('.block_content')).slideDown();
        });
        previous_clicked_block = b;
      }
    }
}

function update(){
  //alert("update");
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify({
      jsonrpc: "2.0",
      method: "query",
      params: {
        type: 1,
        chaincodeID: {
          name: "e7013fe7664a3b52743c0daf075972d011c883a8d4de75a5b5d93e7b064b7e4cd438960e89d7440ef4658e198f316e64e326dbbba333225837d7de8f7fdeeba9"
        },
        ctorMsg: {
          function: "get_count",
          args: [
          ]
        },
        secureContext: "admin"
      },
      id: 0
    }),
    contentType: 'application/json',
    crossDomain: true,
    url: 'https://013148a355384b06820606ca19eb5374-vp0.us.blockchain.ibm.com:5003/chaincode',
    success: function(d) {
    //  alert(JSON.stringify(d));
      //alert(d.result.message);
      count = parseInt(d.result.message);
      precount = parseInt(localStorage.getItem("precount"));
      //alert(precount);
      //alert(count);
      //alert(precount+1);
      if(count>precount){
        for (i=precount+1; i<=count; i++){
          var id = i.toString();
          var newblock = '<div class="individual_block" id="'+id+'" onclick="block_click(this)"><div class="block_header"></div><div class="block_content"></div></div>';
          $('.block_scroll').append(newblock);
          //alert(j);
        }
        $('.block_content').hide();

        /*for (i=precount+1; i<=count; i++){
          var id = '#'+i.toString();
          $(id).on('click',function(e){
            var b = "#"+this.id;
            //alert(b);
              if($(b).attr('data-click-state') == 1) {
                $(b).attr('data-click-state', 0)
                $(b+' .block_content').slideUp(function() {
                    $(b).switchClass('block_transition_right','individual_block',1000,function(){
                    });
                });
                previous_clicked_block = '';
              } else {
                if(previous_clicked_block!=b && previous_clicked_block!=''){
                  $(previous_clicked_block).attr('data-click-state', 0)
                  $(previous_clicked_block+' .block_content').slideUp(function() {
                    $(previous_clicked_block).switchClass('block_transition_right','individual_block',1000,function(){});
                      $(b).attr('data-click-state', 1)
                      $(b).switchClass('individual_block','block_transition_right',1000, function(){
                        $(b+' .block_content').slideDown(function() {
                          previous_clicked_block = b;
                        });
                      });
                  });
                }else{
                  $(b).attr('data-click-state', 1)
                  $(b).switchClass('individual_block','block_transition_right',1000, function(){
                      $(b+' .block_content').slideDown();
                  });
                  previous_clicked_block = b;
                }
              }
          });
        }
        */
        for (i=precount+1; i<=count; i++){
          var j = i.toString();
          $.ajax({
            type: 'POST',
            dataType: 'json',
            indexValue: i,
            data: JSON.stringify({
              jsonrpc: "2.0",
              method: "query",
              params: {
                type: 1,
                chaincodeID: {
                  name: "e7013fe7664a3b52743c0daf075972d011c883a8d4de75a5b5d93e7b064b7e4cd438960e89d7440ef4658e198f316e64e326dbbba333225837d7de8f7fdeeba9"
                },
                ctorMsg: {
                  function: "get_transaction",
                  args: [ j
                  ]
                },
                secureContext: "admin"
              },
              id: 0
            }),
            contentType: 'application/json',
            crossDomain: true,
            url: 'https://013148a355384b06820606ca19eb5374-vp0.us.blockchain.ibm.com:5003/chaincode',
            success: function(d) {
              //alert(JSON.stringify(d));
              //alert( d.result.message);
              var result = JSON.parse( d.result.message);
              var billjson = JSON.parse(result.bill_details);
              var status = result.operation;
              if(result.operation =='Submit'){
                status = "Create";
              }
              if (result.operation == "Pay"){
                status = "Process Payment";
              }
              var newentry ='<b>Entity Name:</b>'+result.entity_involved.entity_name+'<br>'+
                            '<b>Entity Role:</b>'+result.entity_involved.entity_role+'<br>'+
                            '<b>Claim Id:</b>'+result.claim_id+'<br>'+
                            '<b>Bill Id:</b>'+result.bill_id+'<br>'+
                            '<b>Operation:</b>'+status+'<br>'+
                            '<b>Status:</b>'+result.bill_status+'<br>'+
                            '<b>Amount Claimed:</b>'+billjson.amount_claimed+'<br>'+
                            '<b>Amount Approved:</b>'+billjson.amount_approved+'<br>'+
                            '<b>Comments:</b>'+billjson.reason+'<br>'+
                            '<b>Date:</b>'+result.date+'<br>';

              var element_id = "#"+this.indexValue;
              //alert(element_id);
              $(element_id+' .block_header').html('<div><span class="bill_id">'+result.bill_id+'</span><br>'+result.bill_status+'</div>');
              $(element_id+' .block_content').html(newentry);
              if(result.bill_status == 'Received'){
                received_bills = received_bills+1;
                $(element_id).addClass('received');
              }
              if(result.bill_status == 'Approved'){
                approved_bills = approved_bills+1;
                $(element_id).addClass('approved');
              }
              if(result.bill_status == 'Partially approved'){
                partially_approved_bills = partially_approved_bills+1;
                $(element_id).addClass('partially_approved');
              }
              if(result.bill_status == 'Rejected'){
                rejected_bills = rejected_bills+1;
                $(element_id).addClass('rejected');
              }
              if(result.bill_status == 'Paid'){
                paid_bills = paid_bills+1;
                $(element_id).addClass('paid');
              }
              total_transactions = count;
              document.getElementById('total_transactions').innerHTML = total_transactions;
              document.getElementById('received_bills').innerHTML = received_bills;
              document.getElementById('approved_bills').innerHTML = approved_bills;
              document.getElementById('partially_approved_bills').innerHTML = partially_approved_bills;
              document.getElementById('paid_bills').innerHTML = paid_bills;
              document.getElementById('rejected_bills').innerHTML = rejected_bills;
            },
            error: function(e)
            {
                  alert("Error while updating the result");
                  //alert(JSON.stringify(e));
            }
          });
        }

      }
      localStorage.setItem("precount",count);
    },
    error: function(e)
    {
          alert("Error while updating the result");
          //alert(JSON.stringify(e));
    }
  });
}
