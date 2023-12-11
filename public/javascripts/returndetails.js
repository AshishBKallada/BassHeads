function updateStatus(selectedStatus,returnId) {
    alert('1')
console.log('Selected Status:', selectedStatus);
alert(returnId)

$.ajax({
url: '/admin/return/delivery', 
method: 'POST',
data: { status: selectedStatus, },
success: function(response) {
  console.log('Status updated successfully');
},
error: function(error) {
  console.error('Error updating status:', error);
}
});

}
