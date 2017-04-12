var siteUrl=window.location.protocol+"//"+window.location.host+_spPageContextInfo.webServerRelativeUrl
var relation=[];//calculated relationship in between select tags
var mySelect    //All select fields available in form
var mySelectR=[]	//All select field with relationships
var mySelectDefault=[] //Default Html of "Select Fields" 
var cList=_spPageContextInfo.serverRequestPath.split(_spPageContextInfo.webServerRelativeUrl+"/Lists/")[1].split("/")[0]
$(document).ready(function(){
	//alert("hello");
	
	
	
	
	
	
	
	$.ajax({
			//url: siteUrl+"/_api/web/lists/getbytitle('Document%20Information')/items?$select=DocumentAuthor/Title,Directorate/Dir_x0020_Abbr,Division/DivisionAbbr,*&$filter=Id eq "+selectId+"&$expand=Directorate,Division,DocumentAuthor",
			//url: siteUrl+"/_api/web/lists/getbytitle('CD%20Tags')/items?$select=*&$filter=Active eq 'Yes'",
			url: siteUrl+"/_api/web/lists",
			method: "GET",
			headers: {"Accept":"application/json; odata=verbose"},
			success: function(data){						
					buildRelationship(data)
					addEventSelect()		//add change events to "select" tags
					initializeSuperParent()
			},
			error: function (data){
				alert('failure')
			}
	});
})


//this function attach on change event to all "select" fields having relationship
var addEventSelect=function(data){
	$(mySelectR).on("change",function(){
		populateChild(this)
		
	})
}



//this function identify relationship between "select" fields
var buildRelationship=function(data){
	mySelect=$("select")
	var myTotalSelect=mySelect.length
	var myTotalLists=data.d.results.length
	var k=0;
	relation=[]
	for (var i=0;i<myTotalSelect;i++){

		for (var j=0;j<myTotalLists;j++){
			if (data.d.results[j].Title==mySelect[i].title){
				relation[k]=data.d.results[j].Title;
				mySelectR[k]=mySelect[i];
				mySelectDefault[k]=$(mySelect[i]).html()
				k++
			}
		}
	
	}
	

}


var initializeSuperParent=function(data){
	
	
	var holdSelect
	var myTotal
	var cId=SP.ScriptHelpers.getDocumentQueryPairs()["ID"]
	//var cList="Main"
	
	if (cId){// "Edit Form"
		$.ajax({
				
				url: siteUrl+"/_api/web/lists/getbytitle('"+cList+"')/items?$select=*&$filter=Id eq "+cId+"",
				method: "GET",
				headers: {"Accept":"application/json; odata=verbose"},
				success: function(data){
					var myLen=relation.length
					
					for (var i=0;i<myLen;i++){
						$(mySelectR[i]).prepend("<option value="+data.d.results[0][relation[i]]+" selected='selected'>"+data.d.results[0][relation[i]]+"</option>")
					
					}	
						
				},
				error: function (data){
					alert('failure')
				}
		});
		
	
	}
	// "New Form"
		$.ajax({
				
				url: siteUrl+"/_api/web/lists/getbytitle('"+relation[0]+"')/items",
				method: "GET",
				headers: {"Accept":"application/json; odata=verbose"},
				success: function(data){						
						myTotal=data.d.results.length
						for(var i=0;i<myTotal;i++){
							$(mySelectR[0]).append("<option value="+data.d.results[i].Name+">"+data.d.results[i].Name+"</option>")
						}
						
				},
				error: function (data){
					alert('failure')
				}
		});	
	
	
	
}


var populateChild=function(myThis){
    var myParent=myThis.title	//Parent Category e.g. Country
	var myParentName=myThis.value //Selected Parent e.g Pakistan
	var myChildIndex=relation.indexOf(myParent)+1//get index
	var myChild=""
	var myTotal	
	if (myChildIndex>relation.length-1){ //if it exceeds....... break
		return 0
	}
	else{//else populate relevant children only
		myChild=relation[myChildIndex]
		$(mySelectR[myChildIndex]).html(mySelectDefault[myChildIndex]) //initializing immediate child with default values
		$.ajax({//populating child with relevant info only
			
			url: siteUrl+"/_api/web/lists/getbytitle('"+myChild+"')/items?$select=*,"+myParent+"/Name,"+myParent+"/Abbr&$expand="+myParent+"&$filter="+myParent+"/Name eq '"+myParentName+"'",
			method: "GET",
			headers: {"Accept":"application/json; odata=verbose"},
			success: function(data){						
					myTotal=data.d.results.length
					
					//populating option tags for child
					for(var i=0;i<myTotal;i++){
						$(mySelectR[myChildIndex]).append("<option value="+data.d.results[i].Name+">"+data.d.results[i].Name+"</option>")
					}
					//reinitializing grand children with default values
					for(var i=myChildIndex+1;i<relation.length;i++){
						$(mySelectR[i]).html(mySelectDefault[i])
					}
					
					
			},
			error: function (data){
				alert('failure')
			}
		});
		
		
	
	}	
		
}