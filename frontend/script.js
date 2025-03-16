document.addEventListener('DOMContentLoaded', () => {
    const ordersTable = document.getElementById('ordersTable');
    const toastContainer = document.getElementById('toast-container');
    let loading = true;
    let deliveringOrderId = null;
  
    // Function to show toast notifications
    function showToast(message, type = 'error') {
      const toast = document.createElement('div');
      toast.classList.add('toast', 'show', type === 'success' ? 'toast-success' : 'toast-error');
      toast.innerText = message;
      toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  
    // Fetch orders from the API
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://adminside-lo8s.onrender.com/courierpanel/orders');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          renderOrders(data);
        } else {
          showToast('Error fetching orders.');
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        showToast('Error fetching orders.');
      } finally {
        loading = false;
      }
    };
  
    // Render orders in the table
    const renderOrders = (orders) => {
      ordersTable.innerHTML = '';
      orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${order._id}</td>
          <td>${order.address.firstName} ${order.address.lastName}</td>
          <td>${order.status}</td>
          <td>₱${order.amount}</td>
          <td>${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zip}</td>
          <td>
            <button class="btn btn-info" onclick="handleDelivered('${order._id}')" ${deliveringOrderId === order._id || order.status === 'Delivered' ? 'disabled' : ''}>
              ${deliveringOrderId === order._id ? "Processing..." : "Delivered"}
            </button>
          </td>
        `;
        ordersTable.appendChild(row);
      });
    };
  
    // Handle delivery of an order
    const handleDelivered = async (orderId) => {
      deliveringOrderId = orderId; // Set the order being processed
      try {
        const response = await fetch(`https://adminside-lo8s.onrender.com/moveToCompleteOrders/${orderId}`, {
          method: 'POST',
        });
  
        if (response.ok) {
          // Successfully moved to completed
          const rows = ordersTable.querySelectorAll('tr');
          rows.forEach(row => {
            if (row.children[0].innerText === orderId) {
              row.remove();
            }
          });
  
          showToast("Order Delivered Successfully", 'success');
        } else {
          let errorMessage = 'Failed to move order to completed';
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (jsonError) {
            console.error("Error parsing JSON error response:", jsonError);
          }
          console.error('Error moving order to completed:', errorMessage);
          showToast(errorMessage);
        }
      } catch (error) {
        console.error('Error in request:', error);
        showToast("Network Error");
      } finally {
        deliveringOrderId = null; // Reset after processing
      }
    };
  
    // Fetch orders when the page loads
    fetchOrders();
  });
  