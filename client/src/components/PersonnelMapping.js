import React, { useState } from 'react';

// Sample data for battalions, companies, and platoons (replace with actual API data)
const sampleBattalions = [
  { id: 1, name: 'Battalion 1' },
  { id: 2, name: 'Battalion 2' },
];
const sampleCompanies = [
  { id: 1, name: 'Company 1', battalionId: 1 },
  { id: 2, name: 'Company 2', battalionId: 1 },
  { id: 3, name: 'Company 3', battalionId: 2 },
];
const samplePlatoons = [
  { id: 1, name: 'Platoon 1', companyId: 1 },
  { id: 2, name: 'Platoon 2', companyId: 2 },
];

const PersonnelMappingForm = () => {
  const [role, setRole] = useState(''); // User-selected role
  const [selectedBattalion, setSelectedBattalion] = useState(''); // Selected battalion
  const [selectedCompany, setSelectedCompany] = useState(''); // Selected company
  const [personnel, setPersonnel] = useState(''); // Personnel name

  // Handle role selection
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedBattalion('');
    setSelectedCompany('');
  };

  // Handle personnel input change
  const handlePersonnelChange = (e) => {
    setPersonnel(e.target.value);
  };

  // Handle battalion and company selection changes
  const handleBattalionChange = (e) => {
    setSelectedBattalion(e.target.value);
    setSelectedCompany('');
  };
  
  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Mapping Submitted: ', { role, personnel, selectedBattalion, selectedCompany });
    // Submit data to backend here
  };

  return (
    <div>
      <h2>Personnel Mapping Form</h2>
      <form onSubmit={handleSubmit}>
        {/* Role Selection */}
        <label>
          Select Role:
          <select value={role} onChange={handleRoleChange} required>
            <option value="">Select Role</option>
            <option value="Commandant">Commandant</option>
            <option value="DeputyCommandant">Deputy/Assistant Commandant</option>
            <option value="Inspector">Inspector/Sub-Inspector</option>
          </select>
        </label>

        {/* Render additional fields based on selected role */}
        {role === 'Commandant' && (
          <>
            <h3>Mapping for Commandant</h3>
            {/* Battalion Form */}
            <label>
              Select Battalion:
              <select value={selectedBattalion} onChange={handleBattalionChange} required>
                <option value="">Select Battalion</option>
                {sampleBattalions.map((battalion) => (
                  <option key={battalion.id} value={battalion.id}>
                    {battalion.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Company Form (based on selected battalion) */}
            {selectedBattalion && (
              <>
                <label>
                  Select Company:
                  <select value={selectedCompany} onChange={handleCompanyChange}>
                    <option value="">Select Company</option>
                    {sampleCompanies
                      .filter((company) => company.battalionId === Number(selectedBattalion))
                      .map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                  </select>
                </label>
              </>
            )}
          </>
        )}

        {role === 'DeputyCommandant' && (
          <>
            <h3>Mapping for Deputy/Assistant Commandant</h3>
            {/* Company Form */}
            <label>
              Select Company:
              <select value={selectedCompany} onChange={handleCompanyChange} required>
                <option value="">Select Company</option>
                {sampleCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Platoon Form (based on selected company) */}
            {selectedCompany && (
              <>
                <label>
                  Select Platoon:
                  <select>
                    <option value="">Select Platoon</option>
                    {samplePlatoons
                      .filter((platoon) => platoon.companyId === Number(selectedCompany))
                      .map((platoon) => (
                        <option key={platoon.id} value={platoon.id}>
                          {platoon.name}
                        </option>
                      ))}
                  </select>
                </label>
              </>
            )}
          </>
        )}

        {role === 'Inspector' && (
          <>
            <h3>Mapping for Inspector/Sub-Inspector</h3>
            {/* Platoon Form */}
            <label>
              Select Platoon:
              <select required>
                <option value="">Select Platoon</option>
                {samplePlatoons.map((platoon) => (
                  <option key={platoon.id} value={platoon.id}>
                    {platoon.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {/* Personnel Input */}
        <label>
          Personnel Name:
          <input type="text" value={personnel} onChange={handlePersonnelChange} required />
        </label>

        <button type="submit">Submit Mapping</button>
      </form>
    </div>
  );
};

export default PersonnelMappingForm;
