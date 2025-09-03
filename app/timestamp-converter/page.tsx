"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Copy, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TimestampConverterPage() {
  const [timestamp, setTimestamp] = useState("")
  const [humanDate, setHumanDate] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [format, setFormat] = useState("iso")
  const [currentTimestamp, setCurrentTimestamp] = useState("")

  useEffect(() => {
    updateCurrentTimestamp()
    const interval = setInterval(updateCurrentTimestamp, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timestamp) {
      convertToHuman()
    }
  }, [timestamp, timezone, format])

  useEffect(() => {
    if (humanDate) {
      convertToTimestamp()
    }
  }, [humanDate])

  const updateCurrentTimestamp = () => {
    setCurrentTimestamp(Math.floor(Date.now() / 1000).toString())
  }

  const convertToHuman = () => {
    try {
      const ts = parseInt(timestamp)
      if (isNaN(ts)) {
        return
      }

      const date = new Date(ts * 1000)
      let formatted = ""

      switch (format) {
        case "iso":
          formatted = date.toISOString()
          break
        case "local":
          formatted = date.toLocaleString()
          break
        case "utc":
          formatted = date.toUTCString()
          break
        case "date-only":
          formatted = date.toDateString()
          break
        case "time-only":
          formatted = date.toTimeString()
          break
      }

      setHumanDate(formatted)
    } catch (error) {
      console.error("Conversion failed:", error)
    }
  }

  const convertToTimestamp = () => {
    try {
      if (!humanDate) return
      
      const date = new Date(humanDate)
      if (isNaN(date.getTime())) {
        return
      }

      const ts = Math.floor(date.getTime() / 1000)
      setTimestamp(ts.toString())
    } catch (error) {
      console.error("Conversion failed:", error)
    }
  }

  const copyValue = (value: string, type: string) => {
    navigator.clipboard.writeText(value)
    toast({
      title: "Copied to clipboard",
      description: `${type} copied`
    })
  }

  const loadCurrentTime = () => {
    setTimestamp(currentTimestamp)
  }

  const loadExample = (exampleType: string) => {
    const now = Date.now()
    switch (exampleType) {
      case "now":
        setTimestamp(Math.floor(now / 1000).toString())
        break
      case "yesterday":
        setTimestamp(Math.floor((now - 24 * 60 * 60 * 1000) / 1000).toString())
        break
      case "week-ago":
        setTimestamp(Math.floor((now - 7 * 24 * 60 * 60 * 1000) / 1000).toString())
        break
      case "year-2000":
        setTimestamp("946684800") // Jan 1, 2000
        break
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Clock className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Timestamp Converter</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert between Unix timestamps and human-readable dates with timezone support and multiple formats.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Current Time */}
          <Card>
            <CardHeader>
              <CardTitle>Current Time</CardTitle>
              <CardDescription>Live Unix timestamp</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-2xl font-mono font-bold">{currentTimestamp}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleString()}
                  </div>
                </div>
                <Button onClick={loadCurrentTime} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Use Current
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Converter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timestamp to Human */}
            <Card>
              <CardHeader>
                <CardTitle>Timestamp to Human Date</CardTitle>
                <CardDescription>Convert Unix timestamp to readable date</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timestamp">Unix Timestamp</Label>
                  <Input
                    id="timestamp"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="1640995200"
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="format">Output Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso">ISO 8601</SelectItem>
                      <SelectItem value="local">Local Format</SelectItem>
                      <SelectItem value="utc">UTC String</SelectItem>
                      <SelectItem value="date-only">Date Only</SelectItem>
                      <SelectItem value="time-only">Time Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Human Date</div>
                  <div className="font-mono text-lg break-all">
                    {humanDate || "Enter timestamp above"}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyValue(humanDate, "Human date")} 
                    disabled={!humanDate}
                    className="mt-2"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Human to Timestamp */}
            <Card>
              <CardHeader>
                <CardTitle>Human Date to Timestamp</CardTitle>
                <CardDescription>Convert readable date to Unix timestamp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="human-date">Human Date</Label>
                  <Input
                    id="human-date"
                    value={humanDate}
                    onChange={(e) => setHumanDate(e.target.value)}
                    placeholder="2024-01-01 12:00:00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Examples: 2024-01-01, Jan 1 2024, 2024-01-01T12:00:00Z
                  </p>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Unix Timestamp</div>
                  <div className="font-mono text-lg">
                    {timestamp || "Enter date above"}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyValue(timestamp, "Timestamp")} 
                    disabled={!timestamp}
                    className="mt-2"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Examples</CardTitle>
              <CardDescription>Load common timestamp examples</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => loadExample("now")}
                  className="h-auto p-3 text-left justify-start"
                >
                  <div>
                    <div className="font-medium">Right Now</div>
                    <div className="text-xs text-muted-foreground">Current time</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadExample("yesterday")}
                  className="h-auto p-3 text-left justify-start"
                >
                  <div>
                    <div className="font-medium">Yesterday</div>
                    <div className="text-xs text-muted-foreground">24 hours ago</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadExample("week-ago")}
                  className="h-auto p-3 text-left justify-start"
                >
                  <div>
                    <div className="font-medium">Week Ago</div>
                    <div className="text-xs text-muted-foreground">7 days ago</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadExample("year-2000")}
                  className="h-auto p-3 text-left justify-start"
                >
                  <div>
                    <div className="font-medium">Y2K</div>
                    <div className="text-xs text-muted-foreground">Jan 1, 2000</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}