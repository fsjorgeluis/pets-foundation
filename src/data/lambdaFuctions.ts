export const lambdaFunctions = ({
	petFoundationLayer,
}: Record<string, any>) => {
	return [
		{
			id: 'CreateFoundation',
			name: 'create-foundation',
			src: 'foundations',
			layers: [petFoundationLayer],
			action: 'createFoundation',
			description: 'Create a new foundation',
		},
		{
			id: 'FindAllFoundations',
			name: 'findAll-foundation',
			src: 'foundations',
			action: 'findAllFoundations',
			description: 'Find all foundations',
		},
		{
			id: 'CreatePet',
			name: 'create-pet',
			src: 'pets',
			layers: [petFoundationLayer],
			action: 'addPet',
			description: 'Add a new pet',
		},
		{
			id: 'FindAllPets',
			name: 'findAll-pet',
			src: 'pets',
			layers: [petFoundationLayer],
			action: 'findAllPets',
			description: 'Find all pets for specific foundation',
		},
		{
			id: 'FindOnePet',
			name: 'findOne-pet',
			src: 'pets',
			action: 'findOnePet',
			description: 'Find one pet for specific foundation by id',
		},
		{
			id: 'UpdatePet',
			name: 'update-pet',
			src: 'pets',
			layers: [petFoundationLayer],
			action: 'updatePet',
			description: 'Update one pet for specific foundation by id',
		},
		{
			id: 'DeletePet',
			name: 'delete-pet',
			src: 'pets',
			action: 'removePet',
			description: 'Delete one pet for specific foundation by id',
		},
		{
			id: 'AdoptPet',
			name: 'adopt-pet',
			src: 'pets',
			action: 'adoptPet',
			description: 'Adopt one pet for specific foundation by id',
		},
	];
};
