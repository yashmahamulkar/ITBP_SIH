// src/CheckpostHierarchy.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../static/CheckpostHierarchy.css'; // Import CSS file

const CheckpostHierarchy = ({ checkpostId }) => {
    const [checkpostData, setCheckpostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null); // State to track expanded section

    useEffect(() => {
        const fetchCheckpostData = async () => {
            try {
                const response = await axios.get(`/api/get-checkpost-details`);
                setCheckpostData(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCheckpostData();
    }, [checkpostId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div id="chmain">
            <h1>Checkpost Hierarchy</h1>
            <div
                className="section"
                onMouseEnter={() => setExpandedSection('checkpost')}
                onMouseLeave={() => setExpandedSection(null)}
            >
                <h2>Checkpost Details</h2>
                {expandedSection === 'checkpost' && (
                    <div className="details">
                        
                        <p>Name: {checkpostData.checkpost_name}</p>
                        <p>Headquarter: {checkpostData.headquarter}</p>
                        <p>Latitude: {checkpostData.latitude}</p>
                        <p>Longitude: {checkpostData.longitude}</p>
                    </div>
                )}
            </div>

            <div
                className="section"
                onMouseEnter={() => setExpandedSection('platoon')}
                onMouseLeave={() => setExpandedSection(null)}
            >
                <h2>Platoon</h2>
                {checkpostData.platoon ? (
                    expandedSection === 'platoon' && (
                        <div className="details">
                           
                            <p>Platoon Name: {checkpostData.platoon.platoon_name}</p>
                            <h3>Head</h3>
                            <p>Name: {checkpostData.platoon.head.head_name}</p>
                            <p>Rank: {checkpostData.platoon.head.rank}</p>
                            <p>Phone: {checkpostData.platoon.head.phone}</p>
                            <p>Email: {checkpostData.platoon.head.email}</p>
                        </div>
                    )
                ) : (
                    <p>No Platoon data available.</p>
                )}
            </div>

            <div
                className="section"
                onMouseEnter={() => setExpandedSection('battalion')}
                onMouseLeave={() => setExpandedSection(null)}
            >
                <h2>Battalion</h2>
                {checkpostData.battalion ? (
                    expandedSection === 'battalion' && (
                        <div className="details">
                            
                            <p>Battalion Name: {checkpostData.battalion.battalion_name}</p>
                            <h3>Head</h3>
                            <p>Name: {checkpostData.battalion.head.head_name}</p>
                            <p>Rank: {checkpostData.battalion.head.rank}</p>
                            <p>Phone: {checkpostData.battalion.head.phone}</p>
                            <p>Email: {checkpostData.battalion.head.email}</p>
                        </div>
                    )
                ) : (
                    <p>No Battalion data available.</p>
                )}
            </div>

            <div
                className="section"
                onMouseEnter={() => setExpandedSection('company')}
                onMouseLeave={() => setExpandedSection(null)}
            >
                <h2>Company</h2>
                {checkpostData.company ? (
                    expandedSection === 'company' && (
                        <div className="details">
                           
                            <p>Company Name: {checkpostData.company.company_name}</p>
                            <h3>Head</h3>
                            <p>Name: {checkpostData.company.head.head_name}</p>
                            <p>Rank: {checkpostData.company.head.rank}</p>
                            <p>Phone: {checkpostData.company.head.phone}</p>
                            <p>Email: {checkpostData.company.head.email}</p>
                        </div>
                    )
                ) : (
                    <p>No Company data available.</p>
                )}
            </div>

            <div
                className="section"
                onMouseEnter={() => setExpandedSection('sections')}
                onMouseLeave={() => setExpandedSection(null)}
            >
                <h2>Sections</h2>
                {checkpostData.sections.length > 0 ? (
                    expandedSection === 'sections' && (
                        <div className="details">
                            {checkpostData.sections.map((section) => (
                                <div key={section.section_id}>
                                    
                                    <p>Section Name: {section.section_name}</p>
                                    <h4>Head</h4>
                                    {section.head ? (
                                        <div>
                                            <p>Name: {section.head.head_name}</p>
                                            <p>Rank: {section.head.rank}</p>
                                            <p>Phone: {section.head.phone}</p>
                                            <p>Email: {section.head.email}</p>
                                        </div>
                                    ) : (
                                        <p>No Head information available.</p>
                                    )}
                                    <h4>Personnel</h4>
                                    {section.personnel.length > 0 ? (
                                        section.personnel.map((person) => (
                                            <div key={person.personnel_id}>
                                                
                                                <p>Name: {person.personnel_name}</p>
                                                <p>Rank: {person.rank}</p>
                                                <p>Phone: {person.phone}</p>
                                                <p>Email: {person.email}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No Personnel data available.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <p>No Sections available.</p>
                )}
            </div>
        </div>
    );
};

export default CheckpostHierarchy;
