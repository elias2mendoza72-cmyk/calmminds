import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Plus, Trash2, Heart, Shield, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const CRISIS_HOTLINES = [
  { name: "National Suicide Prevention", phone: "988", country: "US" },
  { name: "Crisis Text Line", phone: "Text HOME to 741741", country: "US" },
  { name: "SAMHSA Helpline", phone: "1-800-662-4357", country: "US" },
  { name: "International Association for Suicide Prevention", phone: "https://www.iasp.info/resources/Crisis_Centres/", isLink: true },
];

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });

  useEffect(() => {
    const saved = localStorage.getItem("emergencyContacts");
    if (saved) {
      setContacts(JSON.parse(saved));
    }
  }, []);

  const saveContacts = (updated: Contact[]) => {
    setContacts(updated);
    localStorage.setItem("emergencyContacts", JSON.stringify(updated));
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Please fill in name and phone number");
      return;
    }
    
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact
    };
    
    saveContacts([...contacts, contact]);
    setNewContact({ name: "", phone: "", relationship: "" });
    setIsDialogOpen(false);
    toast.success("Contact added");
  };

  const deleteContact = (id: string) => {
    saveContacts(contacts.filter(c => c.id !== id));
    toast.success("Contact removed");
  };

  const callContact = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, "")}`;
  };

  return (
    <div className="space-y-4">
      {/* Crisis Hotlines */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-red-400" />
            <h3 className="font-display font-semibold text-panic-text">Crisis Hotlines</h3>
          </div>
          <div className="space-y-2">
            {CRISIS_HOTLINES.map((hotline, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-panic-bg/50 rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium text-panic-text">{hotline.name}</p>
                  <p className="text-xs text-panic-text/60">{hotline.country}</p>
                </div>
                {hotline.isLink ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(hotline.phone, "_blank")}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Find Help
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => callContact(hotline.phone)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    {hotline.phone}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Contacts */}
      <Card className="bg-panic-accent/10 border-panic-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-panic-accent" />
              <h3 className="font-display font-semibold text-panic-text">My Support Circle</h3>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-panic-accent hover:bg-panic-accent/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-panic-bg border-panic-accent/20">
                <DialogHeader>
                  <DialogTitle className="text-panic-text">Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-panic-text/80">Name</Label>
                    <Input
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="Mom, Best Friend, Therapist..."
                      className="bg-panic-bg/50 border-panic-accent/30 text-panic-text"
                    />
                  </div>
                  <div>
                    <Label className="text-panic-text/80">Phone Number</Label>
                    <Input
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className="bg-panic-bg/50 border-panic-accent/30 text-panic-text"
                    />
                  </div>
                  <div>
                    <Label className="text-panic-text/80">Relationship (optional)</Label>
                    <Input
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      placeholder="Family, Friend, Professional..."
                      className="bg-panic-bg/50 border-panic-accent/30 text-panic-text"
                    />
                  </div>
                  <Button
                    onClick={addContact}
                    className="w-full bg-panic-accent hover:bg-panic-accent/80 text-white"
                  >
                    Save Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-6">
              <Heart className="w-10 h-10 text-panic-accent/30 mx-auto mb-2" />
              <p className="text-panic-text/60 text-sm">
                Add trusted people you can reach out to
              </p>
              <p className="text-panic-text/40 text-xs mt-1">
                Your contacts are stored locally on this device
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between bg-panic-bg/50 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-panic-text">{contact.name}</p>
                    {contact.relationship && (
                      <p className="text-xs text-panic-text/60">{contact.relationship}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => callContact(contact.phone)}
                      className="border-panic-accent/30 text-panic-accent hover:bg-panic-accent/20"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteContact(contact.id)}
                      className="text-panic-text/40 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-panic-text/60 text-sm">
        You're not alone. Help is always available. 💙
      </p>
    </div>
  );
}
