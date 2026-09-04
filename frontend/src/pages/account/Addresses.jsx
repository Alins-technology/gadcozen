import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../../services/userService.js";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../services/api.js";

const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    fetchAddresses()
      .then((data) => setAddresses(data.addresses))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (address) => {
    setForm(address);
    setEditingId(address._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { addresses } = await updateAddress(editingId, form);
        setAddresses(addresses);
      } else {
        const { addresses } = await addAddress(form);
        setAddresses(addresses);
      }
      showToast("Address saved", "success");
      setModalOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async (id) => {
    const { addresses } = await deleteAddress(id);
    setAddresses(addresses);
    showToast("Address removed", "success");
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-900">Saved Addresses</h3>
        <button onClick={openNew} className="btn-outline !py-2 text-sm">
          <Plus size={15} /> Add Address
        </button>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-ink-500">Loading…</p>
      ) : addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses saved" message="Add an address for faster checkout." />
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr._id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                  {addr.label} {addr.isDefault && "· Default"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(addr)} className="text-ink-500 hover:text-brand-700">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(addr._id)} className="text-ink-500 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-ink-700">
                {addr.fullName}
                <br />
                {addr.line1} {addr.line2}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                {addr.phone}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Address" : "Add Address"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Label (Home/Work)"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="input-field"
            />
            <input
              required
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="input-field"
            />
          </div>
          <input
            required
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="input-field"
          />
          <input
            required
            placeholder="Address line 1"
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            className="input-field"
          />
          <input
            placeholder="Address line 2"
            value={form.line2}
            onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
            className="input-field"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="input-field"
            />
            <input
              required
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              className="input-field"
            />
            <input
              required
              placeholder="Postal code"
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              className="input-field"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="accent-brand-600"
            />
            Set as default address
          </label>
          <button type="submit" className="btn-primary w-full">
            Save Address
          </button>
        </form>
      </Modal>
    </div>
  );
}
