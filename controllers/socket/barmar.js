const User = require('../../models/User');
const Order = require('../../models/Order');
const Local = require('../../models/Local')
const verifyBarman = async (requestFromBarman) => {
    let data = ''
    if (requestFromBarman) {
        data = JSON.parse(requestFromBarman)
    } else {
        return
    }
    const user = await User.findOne({ _id: data._id }).select('-password');
    if (!user) {
        return false
    } else {
        let starterOrders = await allRelevanOrders(data._id)
        return starterOrders
    }
};

const handleOrderStatus = async (data, status, io) => {
    const id = data._id;
    const order = await Order.findOne({ _id: id });

    if (!order) {
        return 'error'
    }

    order.status = status;
    await order.save();
    return 'ok'
};


const allRelevanOrders = async (id) => {
    const local = await Local.find({ owner: id })
    const orders = await Order.find({ local: local[0]._id, status: 'paid' });
    return orders
} 

module.exports = {
    verifyBarman, 
    handleOrderStatus,
    allRelevanOrders
};
  
  