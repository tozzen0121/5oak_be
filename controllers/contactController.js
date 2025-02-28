
const Contact = require('../models/Contact');

const mailchimp = require('@mailchimp/mailchimp_transactional')(process.env.MANDRILL_API_KEY);



exports.get = async (req, res, next) => {
    try {

        const contacts = await Contact.find();

        res.status(201).json({ data: contacts });
    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the Contact record by ID
        const contacts = await Contact.findById(id);
    
        if (!contacts) {
            return res.status(404).json({ message: 'Contact not found' });
        }
    
        res.status(200).json({ data: contacts });
    } catch (error) {
        next(error);
    }
};

exports.save = async (req, res, next) => {
    
    const { name, email, comment } = req.body;
    try {
        const response = await mailchimp.messages.send({
            message: {
                from_email: email,    // Sender's email address
                subject: name,           // Email subject
                text: comment,           // Email content in plain text
                to: [
                    {
                        email: 'info@5oakgames.com',      // Recipient's email address
                        type: 'to'
                    }
                ]
            }
        });
        console.log(response);
        
        // Create a new Contact document
        const contact = new Contact({
            name,
            email, 
            comment,
        });
    
        // Save the Contact document to the database
        await contact.save();

        res.status(201).json({
            message: 'Data saved successfully',
            data: contact
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    // Handle file upload

    const { id } = req.params;
    const { name, email, comment } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
    }

    try {

            // Update the Contact record with the new data
        contact.name = name || contact.name;
        contact.email = email || contact.email;
        contact.comment = comment || contact.comment;

        // Save the updated Contact record
        await contact.save();

        res.status(201).json({
            message: 'File uploaded and data saved successfully',
            data: contact
        });
    } catch (error) {
        next(error);
    }
};


exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the news record by ID
        const contact = await Contact.findById(id);
    
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        // Delete the Contact record from MongoDB
        await Contact.findByIdAndDelete(id);
    
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        next(error);
    }
};