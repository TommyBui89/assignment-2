import { useState, useEffect, useCallback } from "react";

function App() {
    const [contacts, setContacts] = useState([]);
    const [newContactName, setNewContactName] = useState("");

    const fetchData = async (url, options = {}) => {
        const response = await fetch(url, options);
        return response.json();
    };

    const fetchContacts = useCallback(async () => {
        try {
            const data = await fetchData("http://localhost:5001/api/contacts");
            setContacts(data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const createContact = async (name) => {
        if (name.trim() === "") {
        alert("Contact name cannot be blank");
        return;
        }
        try {
        await fetchData("http://localhost:5001/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        fetchContacts();
        } catch (error) {
        console.log("Error:", error);
        }
    };

    const deleteContact = async (contactId) => {
        try {
        await fetchData(`http://localhost:5001/api/contacts/${contactId}`, {
            method: "DELETE",
        });
        fetchContacts();
        } catch (error) {
        console.log("Error:", error);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Contactor</h1>
            <div className="mainContainer">
                <h2 style={{fontSize:'4vh'}}>Contact</h2>
                <div style={styles.contactForm}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Name"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                    />
                    <button style={styles.buttonAdd} onClick={() => createContact(newContactName)}>
                        Create Contact
                    </button>
                </div>
                <hr />
                <div className="contactList">
                    {contacts.map((contact) => (
                        <ContactCard
                        key={contact.id}
                        contact={contact}
                        deleteContact={deleteContact}
                        fetchData={fetchData}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ContactCard({ contact, deleteContact, fetchData }) {
    const [phones, setPhones] = useState([]);
    const [phoneName, setPhoneName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showDetails, setShowDetails] = useState(false);

    const fetchPhones = async () => {
        try {
            const data = await fetchData(`http://localhost:5001/api/contacts/${contact.id}/phones`);
            setPhones(data);
        } catch (error) {
            console.log("Error fetching phones:", error);
        }
    };

    useEffect(() => {
        fetchPhones();
    }, [contact.id, fetchData]);

    const addPhone = async () => {
        if (!phoneName.trim() || !phoneNumber.trim()) {
        alert("Both phone name and number are required!");
        return;
        }
        try {
        await fetchData(`http://localhost:5001/api/contacts/${contact.id}/phones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            name: phoneName,
            number: phoneNumber,
            contactId: contact.id
            }),
        });
        setPhoneName("");
        setPhoneNumber("");
        fetchPhones();
        } catch (error) {
        console.log("Error adding phone:", error);
        }
    };

    const deletePhone = async (phoneId) => {
        try {
        await fetchData(`http://localhost:5001/api/contacts/${contact.id}/phones/${phoneId}`, {
            method: "DELETE",
        });
        fetchPhones();
        } catch (error) {
        console.log("Error deleting phone:", error);
        }
    };

    return (
        <div style={styles.contactCard}>
            <div className="Info" onClick={() => setShowDetails(!showDetails)} style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{ fontWeight: 'bold', fontSize:'4vh' }}>{contact.name}</div>
                <button style={styles.contactDeleteButton} onClick={(e) => { e.stopPropagation(); deleteContact(contact.id); }}>
                Delete
                </button>
            </div>
            {showDetails && (
                <>
                    <div style={{paddingTop:'5px', borderTop:'1px solid black', marginTop:'15px'}}>
                        <div style={styles.phoneInput}>
                            <input 
                            style={styles.input}
                            placeholder="Name" 
                            value={phoneName} 
                            onChange={(e) => setPhoneName(e.target.value)}
                            />
                            <input 
                            style={styles.input}
                            placeholder="Phone Number" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <button style={styles.button} onClick={addPhone}>Add</button>
                        </div>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.row}>
                                    <th style={styles.headerCell}>Name</th>
                                    <th style={styles.headerCell}>Number</th>
                                    <th style={styles.headerCell}></th>
                                </tr>
                            </thead>
                            <tbody>
                            {phones.map(phone => (
                                <tr key={phone.id} style={styles.row}>
                                    <td style={styles.cell}>{phone.name}</td>
                                    <td style={styles.cell}>{phone.number}</td>
                                    <td style={{ ...styles.cell, ...styles.lastCell }}>
                                        <button style={styles.buttonDelete} onClick={() => deletePhone(phone.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        width: '50%',
        margin: '0 auto',
        paddingTop: '50px',
        paddingBottom: '50px',
        backgroundColor: '#fff',
        padding: '10px',
        borderRadius: '10px',
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },
    header: {
        fontSize:'5vh',
        fontWeight: 'bold',
        marginBottom: '40px',
        textAlign: 'center'
    },
    contactForm: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
    },
    input: {
        flex: 1,
        padding: '10px',
        marginRight: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc'
    },
    button: {
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginLeft: '10px',
        color:'white',
        backgroundColor:'#4CAF50'

    },
    contactCard: {
        border: '1px solid #e0e0e0',
        padding: '15px',
        marginTop: '20px',
        borderRadius: '5px',
        position: 'relative'
    },
    phoneInput: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '10px',
        marginBottom: '10px'
    },
    phoneRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
        alignItems: 'center',
        padding: '10px 0',
    },
    deleteButton: {
        backgroundColor: 'red',
        color: 'white'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    row: {
        display: 'flex',
    },
    headerCell: {
        flex: 1,
        padding: '10px',
        border: '1px solid #ccc',
        fontWeight: 'bold',
        textAlign: 'left'
    },
    cell: {
        flex: 1,
        padding: '10px',
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center'
    },
    lastCell: {
        textAlign:'center',
        margin:'0px'
    }
};

styles.buttonAdd = {
    ...styles.button,
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer'
};

styles.buttonDelete = {
    ...styles.button,
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer'

};

styles.contactDeleteButton = {
    ...styles.buttonDelete,
};


export default App;
