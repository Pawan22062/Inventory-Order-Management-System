import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { api } from '../services/api';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [lineItems, setLineItems] = useState([{ product_id: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersData, customersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setCustomerId(customers[0]?.id ? String(customers[0].id) : '');
    setLineItems([{ product_id: products[0]?.id ? String(products[0].id) : '', quantity: 1 }]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCustomerId('');
    setLineItems([{ product_id: '', quantity: 1 }]);
  };

  const updateLineItem = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { product_id: '', quantity: 1 }]);
  };

  const removeLineItem = (index) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const estimatedTotal = lineItems.reduce((sum, line) => {
    const product = products.find((p) => String(p.id) === String(line.product_id));
    if (!product || !line.quantity) return sum;
    return sum + Number(product.price) * Number(line.quantity);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const items = lineItems
      .filter((l) => l.product_id && l.quantity > 0)
      .map((l) => ({
        product_id: parseInt(l.product_id, 10),
        quantity: parseInt(l.quantity, 10),
      }));

    if (!customerId) {
      setError('Select a customer');
      setSubmitting(false);
      return;
    }
    if (items.length === 0) {
      setError('Add at least one order line');
      setSubmitting(false);
      return;
    }

    try {
      await api.createOrder({
        customer_id: parseInt(customerId, 10),
        items,
      });
      setSuccess('Order created — stock updated automatically');
      closeModal();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order? Stock will not be restored.')) return;
    setError('');
    setSuccess('');
    try {
      await api.deleteOrder(id);
      setSuccess('Order deleted');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewOrder = async (id) => {
    setError('');
    try {
      const order = await api.getOrder(id);
      setDetailOrder(order);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-subtitle">Create orders with automatic stock deduction</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreate}
          disabled={customers.length === 0 || products.length === 0}
        >
          + Create Order
        </button>
      </header>

      {(customers.length === 0 || products.length === 0) && !loading && (
        <Alert
          type="info"
          message="Add at least one customer and one product before creating orders."
        />
      )}

      <Alert type="error" message={error} onDismiss={() => setError('')} />
      <Alert type="success" message={success} onDismiss={() => setSuccess('')} />

      {loading ? (
        <Loading />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer_name || `Customer #${o.customer_id}`}</td>
                    <td>{formatCurrency(o.total_amount)}</td>
                    <td>{formatDate(o.created_at)}</td>
                    <td className="actions-cell">
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => viewOrder(o.id)}>
                        View
                      </button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(o.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title="Create Order" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Customer
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </label>

            <div className="line-items-section">
              <div className="line-items-header">
                <span>Line Items</span>
                <button type="button" className="btn btn-sm btn-secondary" onClick={addLineItem}>
                  + Add line
                </button>
              </div>
              {lineItems.map((line, index) => (
                <div key={index} className="line-item-row">
                  <select
                    value={line.product_id}
                    onChange={(e) => updateLineItem(index, 'product_id', e.target.value)}
                    required
                  >
                    <option value="">Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_name} — stock: {p.quantity_in_stock} — ${Number(p.price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                    required
                  />
                  {lineItems.length > 1 && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeLineItem(index)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="estimated-total">
              Estimated total: <strong>{formatCurrency(estimatedTotal)}</strong>
              <span className="hint"> (final total calculated by server)</span>
            </p>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detailOrder && (
        <Modal title={`Order #${detailOrder.id}`} onClose={() => setDetailOrder(null)}>
          <div className="order-detail">
            <p>
              <strong>Customer:</strong> {detailOrder.customer_name}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(detailOrder.created_at)}
            </p>
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {detailOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="order-total">
              <strong>Total:</strong> {formatCurrency(detailOrder.total_amount)}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Orders;
