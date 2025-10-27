"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw } from "lucide-react";

export default function TestLocation() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/location/detect');
      const data = await response.json();
      
      console.log('Location detection response:', data);
      setLocationData(data);
      
      if (!response.ok || data.fallback) {
        setError('Location detection failed or returned fallback');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDetecting(false);
    }
  };

  const initializeSettings = async () => {
    setIsDetecting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/regional/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Initialize response:', data);
      
      if (response.ok) {
        alert('✅ Settings initialized! Check Settings → Regional');
      } else {
        setError(data.error || 'Failed to initialize');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Location Detection</h1>
          <p className="text-muted-foreground">Debug location-based regional settings</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location Detection Test
            </CardTitle>
            <CardDescription>
              Test the location detection API and regional settings initialization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button
                onClick={detectLocation}
                disabled={isDetecting}
                className="bg-gradient-brand hover:opacity-90"
              >
                {isDetecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Detect My Location
                  </>
                )}
              </Button>

              <Button
                onClick={initializeSettings}
                disabled={isDetecting}
                variant="outline"
              >
                Initialize Settings
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-semibold">Error:</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {locationData && (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Location Data:</h3>
                  <pre className="text-xs bg-background p-3 rounded overflow-auto">
                    {JSON.stringify(locationData, null, 2)}
                  </pre>
                </div>

                {locationData.location && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-700 mb-2">Detected Location:</h3>
                    <ul className="space-y-1 text-sm text-green-600">
                      <li><strong>Country:</strong> {locationData.location.country}</li>
                      <li><strong>Country Code:</strong> {locationData.location.countryCode}</li>
                      <li><strong>City:</strong> {locationData.location.city || 'N/A'}</li>
                      <li><strong>Timezone:</strong> {locationData.location.timezone || 'N/A'}</li>
                    </ul>
                  </div>
                )}

                {locationData.regionalPreferences && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-700 mb-2">Regional Preferences:</h3>
                    <ul className="space-y-1 text-sm text-blue-600">
                      <li><strong>Currency:</strong> {locationData.regionalPreferences.currency}</li>
                      <li><strong>Timezone:</strong> {locationData.regionalPreferences.timezone}</li>
                      <li><strong>Date Format:</strong> {locationData.regionalPreferences.dateFormat}</li>
                      <li><strong>Time Format:</strong> {locationData.regionalPreferences.timeFormat}</li>
                      <li><strong>Measurement:</strong> {locationData.regionalPreferences.measurementUnit}</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Detect My Location" to test the location API</li>
                <li>Check the console (F12) for detailed logs</li>
                <li>If location is detected correctly, click "Initialize Settings"</li>
                <li>Go to Settings → Regional to verify the changes</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-700 mb-2">⚠️ Localhost Issue:</h3>
              <p className="text-sm text-yellow-600">
                When running on localhost, the IP detection might not work correctly because localhost 
                doesn't have a real public IP. The API will use its own server IP instead. 
                For accurate testing, you may need to deploy to a real server or use a VPN.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
