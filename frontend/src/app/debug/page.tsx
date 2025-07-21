"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { getToken } from "@/lib/api-utils";

export default function DebugPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Extract role from token
      let role = 'user';
      if (token.includes('mock_admin')) {
        role = 'admin';
      } else if (token.includes('mock_seller')) {
        role = 'seller';
      }
      
      setTokenInfo({
        token,
        role,
        timestamp: token.split('_').pop()
      });
    }
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : "Not logged in"}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Token Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {tokenInfo ? JSON.stringify(tokenInfo, null, 2) : "No token found"}
            </pre>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button onClick={() => window.location.href = "/login"}>Go to Login</Button>
        <Button onClick={() => window.location.href = "/admin/dashboard"}>Go to Admin Dashboard</Button>
        <Button onClick={() => window.location.href = "/"}>Go to Home</Button>
      </div>
    </div>
  );
}