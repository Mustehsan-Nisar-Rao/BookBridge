import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/api';
import { FaCloudUploadAlt, FaMoneyBillWave, FaMobileAlt, FaUniversity, FaCreditCard, FaBookOpen } from 'react-icons/fa';

const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: <FaMoneyBillWave style={{ color: '#1d4ed8', fontSize: '1.1rem' }} />,
    color: 'blue',
    numberField: null,
    placeholder: null,
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    icon: <FaMobileAlt style={{ color: '#dc2626', fontSize: '1.1rem' }} />,
    color: 'red',
    numberField: 'jazzcash_number',
    placeholder: 'Enter your JazzCash account number (e.g. 03001234567)',
  },
  {
    id: 'easypaisa',
    label: 'EasyPaisa',
    icon: <FaMobileAlt style={{ color: '#16a34a', fontSize: '1.1rem' }} />,
    color: 'green',
    numberField: 'easypaisa_number',
    placeholder: 'Enter your EasyPaisa account number (e.g. 03451234567)',
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    icon: <FaUniversity style={{ color: '#7c3aed', fontSize: '1.1rem' }} />,
    color: 'purple',
    numberField: 'bank_details',
    placeholder: 'Bank Name, Account Title, IBAN / Account Number',
    isTextarea: true,
  },
];

const colorMap = {
  blue: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-400' },
  red: { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-400' },
  green: { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-400' },
  purple: { border: 'border-purple-400', bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-400' },
};

const AddBookPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    subject: '',
    class_name: '',
    university: '',
    description: '',
    condition: 'good',
    price: '',
    book_type: 'sale',
    isbn: '',
    customSubject: '',
  });
  const [acceptedMethods, setAcceptedMethods] = useState(['cod']);
  const [paymentNumbers, setPaymentNumbers] = useState({
    jazzcash_number: '',
    easypaisa_number: '',
    bank_details: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const subjects = ['Programming', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Economics', 'Others'];
  const conditions = ['like_new', 'good', 'fair', 'poor'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleMethodToggle = (methodId) => {
    setAcceptedMethods(prev =>
      prev.includes(methodId)
        ? prev.filter(m => m !== methodId)
        : [...prev, methodId]
    );
  };

  const handlePaymentNumberChange = (field, value) => {
    setPaymentNumbers(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.author || !formData.subject) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.book_type === 'sale') {
      if (!formData.price) {
        setError('Price is required for sale books');
        return;
      }
      if (!acceptedMethods || acceptedMethods.length === 0) {
        setError('Please select at least one accepted payment method');
        return;
      }
      // Validate that selected digital methods have numbers
      for (const method of PAYMENT_METHODS) {
        if (method.numberField && acceptedMethods.includes(method.id)) {
          if (!paymentNumbers[method.numberField]) {
            setError(`Please enter your ${method.label} account number/details`);
            return;
          }
        }
      }
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));

      if (formData.book_type === 'sale') {
        formDataToSend.append('accepted_payment_methods', acceptedMethods.join(','));
        if (paymentNumbers.jazzcash_number) formDataToSend.append('jazzcash_number', paymentNumbers.jazzcash_number);
        if (paymentNumbers.easypaisa_number) formDataToSend.append('easypaisa_number', paymentNumbers.easypaisa_number);
        if (paymentNumbers.bank_details) formDataToSend.append('bank_details', paymentNumbers.bank_details);
      }

      if (image) formDataToSend.append('image', image);

      // Handle custom subject
      const finalSubject = formData.subject === 'Others' ? formData.customSubject : formData.subject;
      formDataToSend.set('subject', finalSubject);

      await bookService.addBook(formDataToSend);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add book');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-1">Add New Book</h1>
          <p className="text-gray-500 mb-6">List your book for sale or donation</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title and Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Book Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  className="input-field" placeholder="Enter book title" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Author *</label>
                <input type="text" name="author" value={formData.author} onChange={handleChange}
                  className="input-field" placeholder="Author name" required />
              </div>
            </div>

            {/* Subject and ISBN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Subject *</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="input-field" required>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {formData.subject === 'Others' && (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                    <input
                      type="text"
                      name="customSubject"
                      value={formData.customSubject}
                      onChange={handleChange}
                      className="input-field border-blue-300 focus:border-blue-500"
                      placeholder="Enter subject name manually..."
                      required={formData.subject === 'Others'}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ISBN</label>
                <input type="text" name="isbn" value={formData.isbn} onChange={handleChange}
                  className="input-field" placeholder="ISBN" />
              </div>
            </div>

            {/* Class and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Class/Year</label>
                <input type="text" name="class_name" value={formData.class_name} onChange={handleChange}
                  className="input-field" placeholder="e.g., 1st Year" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange} className="input-field">
                  {conditions.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
            </div>

            {/* Book Type and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Book Type *</label>
                <select name="book_type" value={formData.book_type} onChange={handleChange} className="input-field">
                  <option value="sale">For Sale</option>
                  <option value="donation">For Donation</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {formData.book_type === 'sale' ? 'Price (Rs.) *' : 'Price (Optional)'}
                </label>
                <input type="number" name="price" value={formData.price} onChange={handleChange}
                  className="input-field" placeholder="0" required={formData.book_type === 'sale'} />
              </div>
            </div>

            {/* ── Payment Methods Section (Sale only) ── */}
            {formData.book_type === 'sale' && (
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-3 text-base" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCreditCard style={{ color: '#1a3c5e' }} /> Accepted Payment Methods *
                </label>
                <p className="text-sm text-gray-500 mb-4">Select how buyers can pay you. Enter your account number for each selected method.</p>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = acceptedMethods.includes(method.id);
                    const c = colorMap[method.color];
                    return (
                      <div key={method.id} className={`rounded-xl border-2 overflow-hidden transition-all ${isSelected ? c.border + ' ' + c.bg : 'border-gray-200 bg-white'}`}>
                        {/* Checkbox row */}
                        <label className="flex items-center gap-3 p-4 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleMethodToggle(method.id)}
                            className="w-5 h-5 rounded accent-blue-600"
                          />
                          <span className="text-xl">{method.icon}</span>
                          <div>
                            <p className={`font-bold ${isSelected ? c.text : 'text-gray-700'}`}>{method.label}</p>
                            {method.numberField && !isSelected && (
                              <p className="text-xs text-gray-400">Select to enter your account number</p>
                            )}
                          </div>
                        </label>

                        {/* Account number input — shown when selected & has a numberField */}
                        {isSelected && method.numberField && (
                          <div className="px-4 pb-4">
                            <label className={`block text-sm font-semibold mb-1 ${c.text}`}>
                              Your {method.label} Account Details *
                            </label>
                            {method.isTextarea ? (
                              <textarea
                                value={paymentNumbers[method.numberField]}
                                onChange={(e) => handlePaymentNumberChange(method.numberField, e.target.value)}
                                className={`w-full border-2 ${c.border} rounded-lg p-3 text-sm focus:outline-none focus:ring-2 ${c.ring} resize-none h-20`}
                                placeholder={method.placeholder}
                              />
                            ) : (
                              <input
                                type="text"
                                value={paymentNumbers[method.numberField]}
                                onChange={(e) => handlePaymentNumberChange(method.numberField, e.target.value)}
                                className={`w-full border-2 ${c.border} rounded-lg p-3 text-sm focus:outline-none focus:ring-2 ${c.ring}`}
                                placeholder={method.placeholder}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                className="input-field h-24 resize-none"
                placeholder="Describe the book condition, any markings, etc." />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Book Image</label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <input type="file" onChange={handleImageChange} accept="image/*"
                  className="hidden" id="image-input" />
                <label htmlFor="image-input" className="cursor-pointer">
                  <FaCloudUploadAlt className="text-4xl text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">{image?.name || 'No image selected'}</p>
                </label>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full font-semibold disabled:opacity-50 text-lg py-3">
              {isLoading ? 'Adding Book...' : <><FaBookOpen style={{ marginRight: '6px' }} /> Add Book</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage;
