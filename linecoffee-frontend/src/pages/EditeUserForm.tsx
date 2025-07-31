import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";

interface UserData {
  _id?: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  role?: string;
}

interface EditUserFormProps {
  user: UserData;
  onSave: (updatedData: UserData) => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState<UserData>(user);

  useEffect(() => {
    setFormData(user); // تحميل البيانات القديمة لما الفورم تتفتح
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Form>
      <Form.Group className="mb-3" controlId="formName">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formaddress">
        <Form.Label>address</Form.Label>
        <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formPhone">
        <Form.Label>Phone</Form.Label>
        <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Form>
  );
};

export default EditUserForm;
