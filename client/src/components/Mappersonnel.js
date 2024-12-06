import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../static/mappersonnel.css"
const FormPage = () => {
    const [activeForm, setActiveForm] = useState(null);
    const [battalions, setBattalions] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [platoons, setPlatoons] = useState([]);
    const [sections, setSections] = useState([]);
    const [commandants, setCommandants] = useState([]);
    const [heads, setHeads] = useState([]);
    const [checkposts, setCheckposts] = useState([]);
    
    console.log(checkposts);// Fetch battalions for Company form dropdown
    useEffect(() => {
        if (activeForm === 'Company') {
            axios.get('/api/get-battalions')
                .then(response => setBattalions(response.data))
                .catch(error => console.error('Error fetching battalions:', error));
        }
    }, [activeForm]);

    // Fetch companies for Platoon form dropdown
    useEffect(() => {
        if (activeForm === 'Platoon' || activeForm === 'UpdateCompanyHead') {
            axios.get('/api/get-companies')
                .then(response => setCompanies(response.data))
                .catch(error => console.error('Error fetching companies:', error));
        }
    }, [activeForm]);

    // Fetch platoons for Section form dropdown
    useEffect(() => {
        if (activeForm === 'Section' || activeForm === 'UpdatePlatoonHead') {
            axios.get('/api/get-platoons')
                .then(response => setPlatoons(response.data))
                .catch(error => console.error('Error fetching platoons:', error));
        }
    }, [activeForm]);

    // Fetch sections for updating and adding sections
    useEffect(() => {
        if (['UpdateSectionHead', 'AddSection','AddSectionCheckpost'].includes(activeForm)) {
            axios.get('/api/get-sections')
                .then(response => setSections(response.data))
                .catch(error => console.error('Error fetching sections:', error));
        }
    }, [activeForm]);

    // Fetch commandants for Battalion form dropdown
    useEffect(() => {
        if (activeForm === 'Battalion') {
            axios.get('/api/get-commandants')
                .then(response => setCommandants(response.data.commandants))
                .catch(error => console.error('Error fetching commandants:', error));
        }
    }, [activeForm]);


    useEffect(() => {
        if (activeForm === 'AddSectionCheckpost') {
            axios.get('/api/checkposts')
                .then(response => setCheckposts(response.data))
                .catch(error => console.error('Error fetching commandants:', error));
        }
        
    }, [activeForm]);
         


    // Fetch heads for various update forms
    const fetchHeads = (endpoint) => {
        axios.get(endpoint)
            .then(response => setHeads(response.data.heads))
            .catch(error => console.error('Error fetching heads:', error));
    };

    useEffect(() => {
        if (activeForm) {
            if (['UpdateSectionHead'].includes(activeForm)) {
                fetchHeads('/api/get-section-heads');
            } else if (['AddSection'].includes(activeForm)) {
                fetchHeads('/api/get-constable');
            } else if (['UpdateCompanyHead'].includes(activeForm)) {
                fetchHeads('/api/get-company-heads');
            } else if (['UpdatePlatoonHead'].includes(activeForm)) {
                fetchHeads('/api/get-platoon-heads');
            }
        }
    }, [activeForm]);

    const handleFormSubmit = (e, endpoint, successMessage) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        axios.post(endpoint, Object.fromEntries(formData))
            .then(() => alert(successMessage))
            .catch(error => console.error('Error submitting form:', error));
    };

    return (
        <div>
            <h1 id="mphead">Manage Units</h1>
            <div className='tbut'>
                
                <div className='mbut'>
                <button onClick={() => setActiveForm('Battalion')}>Add Battalion</button>
                </div>
                <div className='mbut'>
                <button onClick={() => setActiveForm('Company')}>Add Company</button>
                <button onClick={() => setActiveForm('UpdateCompanyHead')}>Assign Company Head</button>
                
                </div>
                <div className='mbut'>
                <button onClick={() => setActiveForm('Platoon')}>Add Platoon</button>
                <button onClick={() => setActiveForm('UpdatePlatoonHead')}>Assign  Platoon Head</button>
                </div>
                <div className='mbut'>
                <button onClick={() => setActiveForm('Section')}>Add Section</button>
                
               
                <button onClick={() => setActiveForm('UpdateSectionHead')}>Assign  Section Head</button>
                <button onClick={() => setActiveForm('AddSection')}>Assign Section</button>
                </div>
                <div className='mbut'> 
                    <button onClick={() => setActiveForm('AddSectionCheckpost')}>Assign Checkpost</button>
                </div>
            
            </div>
            {activeForm === 'Battalion' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/create-battalion', 'Battalion created!')}>
        <h1 id="mphead2">Register New Battalion</h1>
        <div className='mfield'>
            <label htmlFor='battalion_name'>Register Battalion Name: </label>
            <input type="text" name="battalion_name" placeholder="Battalion Name" required />
        </div>
        <div className='mfield'>
            <label htmlFor='commandant_id'>Select Commandant: </label>
            <select name="commandant_id" required>
                <option value="">Select Commandant</option>
                {commandants.map(commandant => (
                    <option key={commandant.personnel_id} value={commandant.personnel_id}>
                        {commandant.name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Create Battalion</button>
    </form>
)}

{activeForm === 'Company' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/create-company', 'Company created!')}>
        <h1 id="mphead2">Register New Company</h1>
        <div className='mfield'>
            <label htmlFor='company_name'>Register Company Name: </label>
            <input type="text" name="company_name" placeholder="Company Name" required />
        </div>
        <div className='mfield'>
            <label htmlFor='battalion_id'>Select Battalion: </label>
            <select name="battalion_id" required>
                <option value="">Select Battalion</option>
                {battalions.map(battalion => (
                    <option key={battalion.battalion_id} value={battalion.battalion_id}>
                        {battalion.battalion_name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Create Company</button>
    </form>
)}

{activeForm === 'Platoon' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/create-platoon', 'Platoon created!')}>
        <h1 id="mphead2">Register New Platoon</h1>
        <div className='mfield'>
            <label htmlFor='platoon_name'>Register Platoon Name: </label>
            <input type="text" name="platoon_name" placeholder="Platoon Name" required />
        </div>
        <div className='mfield'>
            <label htmlFor='company_id'>Select Company: </label>
            <select name="company_id" required>
                <option value="">Select Company</option>
                {companies.map(company => (
                    <option key={company.company_id} value={company.company_id}>
                        {company.company_name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Create Platoon</button>
    </form>
)}

{activeForm === 'Section' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/create-section', 'Section created!')}>
        <h1 id="mphead2">Register New Section</h1>
        <div className='mfield'>
            <label htmlFor='section_name'>Register Section Name: </label>
            <input type="text" name="section_name" placeholder="Section Name" required />
        </div>
        <div className='mfield'>
            <label htmlFor='platoon_id'>Select Platoon: </label>
            <select name="platoon_id" required>
                <option value="">Select Platoon</option>
                {platoons.map(platoon => (
                    <option key={platoon.platoon_id} value={platoon.platoon_id}>
                        {platoon.platoon_name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Create Section</button>
    </form>
)}

{activeForm === 'UpdateCompanyHead' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/update-company-head', 'Company head updated!')}>
        <h1 id="mphead2">Assign Company Head</h1>
        <div className='mfield'>
            <label htmlFor='company_id'>Select Company: </label>
            <select name="company_id" required>
                <option value="">Select Company</option>
                {companies.map(company => (
                    <option key={company.company_id} value={company.company_id}>
                        {company.company_name}
                    </option>
                ))}
            </select>
        </div>
        <div className='mfield'>
            <label htmlFor='head_id'>Select Head: </label>
            <select name="head_id" required>
                <option value="">Select Head</option>
                {heads.map(head => (
                    <option key={head.personnel_id} value={head.personnel_id}>
                        {head.name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Assign Company Head</button>
    </form>
)}

{activeForm === 'UpdatePlatoonHead' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/update-platoon-head', 'Platoon head updated!')}>
        <h1 id="mphead2">Assign Platoon Head</h1>
        <div className='mfield'>
            <label htmlFor='platoon_id'>Select Platoon: </label>
            <select name="platoon_id" required>
                <option value="">Select Platoon</option>
                {platoons.map(platoon => (
                    <option key={platoon.platoon_id} value={platoon.platoon_id}>
                        {platoon.platoon_name}
                    </option>
                ))}
            </select>
        </div>
        <div className='mfield'>
            <label htmlFor='head_id'>Select Head: </label>
            <select name="head_id" required>
                <option value="">Select Head</option>
                {heads.map(head => (
                    <option key={head.personnel_id} value={head.personnel_id}>
                        {head.name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Assign Platoon Head</button>
    </form>
)}

{activeForm === 'UpdateSectionHead' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/update-section-head', 'Section head updated!')}>
        <h1 id="mphead2">Assign Section Head</h1>
        <div className='mfield'>
            <label htmlFor='section_id'>Select Section: </label>
            <select name="section_id" required>
                <option value="">Select Section</option>
                {sections.map(section => (
                    <option key={section.section_id} value={section.section_id}>
                        {section.section_name}
                    </option>
                ))}
            </select>
        </div>
        <div className='mfield'>
            <label htmlFor='head_id'>Select Head: </label>
            <select name="head_id" required>
                <option value="">Select Head</option>
                {heads.map(head => (
                    <option key={head.personnel_id} value={head.personnel_id}>
                        {head.name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Assign Section Head</button>
    </form>
)}

{activeForm === 'AddSection' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/add-sectiondata', 'Section data added!')}>
        <h1 id="mphead2">Add Section Data</h1>
        <div className='mfield'>
            <label htmlFor='section_id'>Select Section: </label>
            <select name="section_id" required>
                <option value="">Select Section</option>
                {sections.map(section => (
                    <option key={section.section_id} value={section.section_id}>
                        {section.section_name}
                    </option>
                ))}
            </select>
        </div>
        <div className='mfield'>
            <label htmlFor='constable_id'>Select Constable: </label>
            <select name="constable_id" required>
                <option value="">Select Constable</option>
                {heads.map(constable => (
                    <option key={constable.constable_id} value={constable.constable_id}>
                        {constable.name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Add Section Data</button>
    </form>
)}

{activeForm === 'AddSectionCheckpost' && (
    <form className='mform' onSubmit={(e) => handleFormSubmit(e, '/api/update-section-checkpost', 'Section Checkpost updated!')}>
        <h1 id="mphead2">Assign Checkpost to Section</h1>
        <div className='mfield'>
            <label htmlFor='section_id'>Select Section: </label>
            <select name="section_id" required>
                <option value="">Select Section</option>
                {sections.map(section => (
                    <option key={section.section_id} value={section.section_id}>
                        {section.section_name}
                    </option>
                ))}
            </select>
        </div>
        <div className='mfield'>
            <label htmlFor='checkpost_id'>Select Checkpost: </label>
            <select name="checkpost_id" required>
                <option value="">Select Checkpost</option>
                {checkposts.map(checkpost => (
                    <option key={checkpost.id} value={checkpost.id}>
                        {checkpost.name}
                    </option>
                ))}
            </select>
        </div>
        <button type="submit">Assign Section Checkpost</button>
    </form>
)}

        </div>
    );
};

export default FormPage;
