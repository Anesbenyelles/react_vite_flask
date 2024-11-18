import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const ColumnOrder = ({ variables, currentRep, onSubmitData }) => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [order, setOrder] = useState([]);
  const [variablesAOrder, setVariablesAOrder] = useState(variables);

  // Set form value for order
  useEffect(() => {
    setValue("order", order);
  }, [order, setValue]);

  // Reset on variable change
  useEffect(() => {
    setVariablesAOrder(variables);
    setOrder([]);
  }, [variables]);

  const handleOnDrag = (e, item) => {
    e.dataTransfer.setData("item", item);
  };

  const handleOnDrop = (e) => {
    e.preventDefault();
    const item = e.dataTransfer.getData("item");

    // Check if the item is already in the order array
    const itemIndex = order.indexOf(item);
    if (itemIndex === -1) {
      // If not in the order array, add it
      setOrder((prevOrder) => [...prevOrder, item]);
    } else {
      // If already in the order array, move it to the correct position
      const newOrder = [...order];
      newOrder.splice(itemIndex, 1); // Remove item from its old position
      newOrder.push(item); // Add item to the new position
      setOrder(newOrder);
    }

    // Remove the item from variablesAOrder
    setVariablesAOrder((prevVars) => prevVars.filter((v) => v !== item));
  };

  const resetOrder = () => {
    setOrder([]);
    setVariablesAOrder(variables);
  };

  const onSubmit = (data) => {
    console.log("Submitted Data:", data.order);
    if (onSubmitData) {
      onSubmitData(currentRep, data.order);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Select ordinal variables</h2>

      {/* Draggable Items */}
      {variablesAOrder.map((v, index) => (
        <div
          key={index}
          className="p-2 border rounded cursor-grab"
          draggable
          onDragStart={(e) => handleOnDrag(e, v)}
        >
          {v}
        </div>
      ))}

      {/* Drop Zone */}
      <div
        className="p-4 border-dashed border-2 border-gray-400 rounded min-h-[50px] flex flex-col gap-2"
        onDrop={handleOnDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {order.length > 0 ? (
          order.map((o, index) => (
            <div key={index} className="p-2 bg-gray-100 border rounded">
              {o}
            </div>
          ))
        ) : (
          <p className="text-gray-500">Drop items here</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={resetOrder}
        >
          Reset
        </button>
        <input type="hidden" {...register("order")} />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Submit Order
        </button>
      </div>
    </form>
  );
};

export default ColumnOrder;