import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { api } from '../services/api';

const emptyForm = {
  product_name: '',
  sku: '',
  price: '',
  quantity_in_stock: '',
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      product_name: product.product_name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      product_name: form.product_name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };

    if (payload.quantity_in_stock < 0 || Number.isNaN(payload.quantity_in_stock)) {
      setError('Quantity cannot be negative');
      setSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        setSuccess('Product updated successfully');
      } else {
        await api.createProduct(payload);
        setSuccess('Product created successfully');
      }
      closeModal();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setError('');
    setSuccess('');
    try {
      await api.deleteProduct(id);
      setSuccess('Product deleted');
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">Manage catalog and stock levels</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </header>

      <Alert type="error" message={error} onDismiss={() => setError('')} />
      <Alert type="success" message={success} onDismiss={() => setSuccess('')} />

      {loading ? (
        <Loading />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No products yet. Add your first product.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className={p.quantity_in_stock <= 10 ? 'row-warning' : ''}>
                    <td>{p.product_name}</td>
                    <td>
                      <code>{p.sku}</code>
                    </td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.quantity_in_stock}</td>
                    <td className="actions-cell">
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
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
        <Modal title={editingId ? 'Edit Product' : 'New Product'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Product Name
              <input name="product_name" value={form.product_name} onChange={handleChange} required />
            </label>
            <label>
              SKU
              <input name="sku" value={form.sku} onChange={handleChange} required />
            </label>
            <label>
              Price
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            </label>
            <label>
              Quantity in Stock
              <input
                name="quantity_in_stock"
                type="number"
                min="0"
                value={form.quantity_in_stock}
                onChange={handleChange}
                required
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Products;
