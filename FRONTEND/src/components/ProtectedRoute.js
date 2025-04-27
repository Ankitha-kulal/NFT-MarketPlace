                        import React from 'react';
                        import { Navigate, useLocation } from 'react-router-dom';
                        import { useAuth } from '../context/AuthContext';

                        const ProtectedRoute = ({ children, requireCompleteProfile = true }) => {
                        const { user, loading, profileComplete } = useAuth();
                        const location = useLocation();

                        if (loading) {
                            return (
                            <div className="container center-align" style={{ marginTop: '100px' }}>
                                <div className="preloader-wrapper big active">
                                <div className="spinner-layer spinner-blue-only">
                                    <div className="circle-clipper left"><div className="circle"></div></div>
                                    <div className="gap-patch"><div className="circle"></div></div>
                                    <div className="circle-clipper right"><div className="circle"></div></div>
                                </div>
                                </div>
                            </div>
                            );
                        }

                        if (!user) {
                            return <Navigate to="/login" state={{ from: location }} replace />;
                        }

                        if (requireCompleteProfile && !profileComplete) {
                            return <Navigate to="/complete-profile" replace />;
                        }

                        return children;
                        };

                        export default ProtectedRoute;
