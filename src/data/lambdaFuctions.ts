import { LayerStack } from '../../lib/layer-stack';

export const lambdaFunctions = ({ petFoundationLayer }: LayerStack) => {
	return [
		{
			id: 'CreateFoundation',
			name: 'create-foundation',
			src: 'foundations/add',
			layers: [petFoundationLayer],
			action: 'createFoundation',
			description: 'Create a new foundation',
			permission: 'write',
		},
		{
			id: 'FindAllFoundations',
			name: 'findAll-foundation',
			src: 'foundations/find-all',
			action: 'findAllFoundations',
			description: 'Find all foundations',
			permission: 'read',
		},
		{
			id: 'CreatePet',
			name: 'create-pet',
			src: 'pets/add',
			layers: [petFoundationLayer],
			action: 'addPet',
			description: 'Add a new pet',
			permission: 'write',
		},
		{
			id: 'FindAllPets',
			name: 'findAll-pet',
			src: 'pets/find-all',
			layers: [petFoundationLayer],
			action: 'findAllPets',
			description: 'Find all pets for specific foundation',
			permission: 'read',
		},
		{
			id: 'FindOnePet',
			name: 'findOne-pet',
			src: 'pets/find-one',
			action: 'findOnePet',
			description: 'Find one pet for specific foundation by id',
			permission: 'read',
		},
		{
			id: 'UpdatePet',
			name: 'update-pet',
			src: 'pets/update',
			layers: [petFoundationLayer],
			action: 'updatePet',
			description: 'Update one pet for specific foundation by id',
			permission: 'read-write',
		},
		{
			id: 'DeletePet',
			name: 'delete-pet',
			src: 'pets/remove',
			action: 'removePet',
			description: 'Delete one pet for specific foundation by id',
			permission: 'read-write',
		},
		{
			id: 'AdoptPet',
			name: 'adopt-pet',
			src: 'pets/adopt',
			action: 'adoptPet',
			description: 'Adopt one pet for specific foundation by id',
			permission: 'read-write',
		},
	];
};
